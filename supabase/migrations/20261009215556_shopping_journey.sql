-- Atomic, idempotent checkout. Execute only from the validated server route.
alter table public.products add column if not exists sizes text[] not null default '{}';
alter table public.orders
  add column if not exists checkout_key uuid unique,
  add column if not exists request_hash text,
  add column if not exists receipt_token text,
  add column if not exists customer_notes text not null default '';
alter table public.order_items add column if not exists size text not null default '';

create or replace function public.create_store_order(
  p_key uuid, p_hash text, p_token text, p_name text, p_email text,
  p_phone text, p_payment text, p_fulfillment text, p_notes text, p_items jsonb
) returns jsonb
language plpgsql security invoker set search_path = public
as $$
declare
  existing public.orders%rowtype;
  product public.products%rowtype;
  item jsonb;
  new_order_id uuid;
  total numeric(10,2) := 0;
  qty integer;
  selected_size text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_key::text, 0));
  select * into existing from public.orders where checkout_key = p_key;
  if found then
    if existing.request_hash <> p_hash then raise exception 'Checkout request changed. Start a new checkout.'; end if;
    return jsonb_build_object('id', existing.id, 'token', existing.receipt_token, 'reused', true);
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'Invalid cart.';
  end if;
  -- Lock product records in stable order while validating price and availability.
  perform id from public.products where id in (select (value->>'product_id')::uuid from jsonb_array_elements(p_items)) order by id for share;
  for item in select value from jsonb_array_elements(p_items) loop
    qty := (item->>'quantity')::integer;
    selected_size := coalesce(item->>'size', '');
    if qty is null or qty not between 1 and 20 then raise exception 'Invalid quantity.'; end if;
    select * into product from public.products where id = (item->>'product_id')::uuid and is_active;
    if not found then raise exception 'A product is no longer available.'; end if;
    if product.price_is_provisional then raise exception 'Provisional products cannot be ordered.'; end if;
    if (cardinality(product.sizes) > 0 and not selected_size = any(product.sizes))
       or (cardinality(product.sizes) = 0 and selected_size <> '') then
      raise exception 'Choose an available size.';
    end if;
    total := total + product.price_jmd * qty;
  end loop;
  insert into public.orders(customer_name,email,phone,subtotal_jmd,payment_method,payment_status,payment_provider,fulfillment_method,checkout_key,request_hash,receipt_token,customer_notes)
  values(p_name,p_email,p_phone,total,p_payment,case when p_payment='bank_transfer' then 'manual_verification' else 'pending' end,case when p_payment='stripe' then 'stripe' end,p_fulfillment,p_key,p_hash,p_token,p_notes)
  returning id into new_order_id;
  insert into public.order_items(order_id,product_id,product_name,quantity,unit_price_jmd,size)
  select new_order_id,p.id,p.name,(i->>'quantity')::integer,p.price_jmd,coalesce(i->>'size','')
  from jsonb_array_elements(p_items) i join public.products p on p.id=(i->>'product_id')::uuid;
  return jsonb_build_object('id', new_order_id, 'token', p_token, 'reused', false);
end;
$$;
revoke all on function public.create_store_order(uuid,text,text,text,text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.create_store_order(uuid,text,text,text,text,text,text,text,text,jsonb) to service_role;
-- Staff can read receipt-bearing records through existing staff-only RLS; customers
-- access a minimized receipt through a server endpoint using a high-entropy token.
