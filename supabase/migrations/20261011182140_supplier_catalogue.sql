-- Legacy products retain their prior ordering behavior and all identity/content fields.
-- New rows default to closed. Planning phase never grants visibility or ordering.
begin;
alter table public.products
  alter column price_jmd drop not null,
  add column catalogue_sku text unique,
  add column launch_phase text check (launch_phase in ('Core','Phase 2','Drop')),
  add column availability text not null default 'available' check (availability in ('planned','available','unavailable')),
  add column public_content_approved boolean not null default true,
  add column variants_approved boolean not null default true;
alter table public.products
  alter column availability set default 'planned',
  alter column public_content_approved set default false,
  alter column variants_approved set default false;

-- Source identity is durable even when staff edit public listing fields.
create function public.keep_catalogue_sku() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if old.catalogue_sku is not null and new.catalogue_sku is distinct from old.catalogue_sku then
    raise exception 'Source SKU is immutable; use the reviewed crosswalk workflow.';
  end if;
  return new;
end;
$$;
revoke all on function public.keep_catalogue_sku() from public, anon, authenticated;
create trigger keep_catalogue_sku before update of catalogue_sku on public.products
for each row execute function public.keep_catalogue_sku();

-- Never put sourcing/commercial fields in public.products: its active rows are
-- anonymously readable. This schema is not exposed through the Data API and has
-- no browser grants; even authenticated staff use an authorized database workflow.
create schema catalogue_private;
revoke all on schema catalogue_private from public, anon, authenticated;
grant usage on schema catalogue_private to service_role;
create table catalogue_private.sources (
  digest text primary key,
  workbook_id text not null,
  retrieved_at timestamptz not null,
  snapshot jsonb not null,
  imported_at timestamptz not null default now()
);
create table catalogue_private.planned_skus (
  source_sku text primary key,
  product_id uuid not null unique references public.products(id),
  source_digest text not null references catalogue_private.sources(digest),
  source_row integer not null,
  supplier_requirements text,
  creative_suggestions text,
  manufacturing_notes text,
  proposed_variants text,
  compliance_notes text,
  commercial_inputs jsonb not null default '{}',
  -- No matching evidence exists in this workbook. Explicit future crosswalks
  -- require a documented decision; importer never guesses by similar names.
  matched_existing_product_id uuid references public.products(id),
  match_evidence text,
  check ((matched_existing_product_id is null) = (match_evidence is null))
);
alter table catalogue_private.sources enable row level security;
alter table catalogue_private.planned_skus enable row level security;
revoke all on all tables in schema catalogue_private from public, anon, authenticated;
grant select, insert, update on all tables in schema catalogue_private to service_role;
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
    if product.price_jmd is null or product.price_jmd <= 0 or product.price_jmd::text = 'NaN'
       or product.availability <> 'available'
       or not product.public_content_approved or not product.variants_approved then
      raise exception 'This product is planned or not approved for ordering.';
    end if;
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

commit;
