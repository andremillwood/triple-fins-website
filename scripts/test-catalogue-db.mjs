// Isolated PostgreSQL integration tests. No Supabase credentials or external calls.
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { generateImport, previews } from './import-catalogue.mjs';
const container = `tf-catalogue-${process.pid}`;
function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', maxBuffer: 8e6 });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}
const sql = text => docker(['exec','-i',container,'psql','-h','127.0.0.1','-X','-U','postgres','-v','ON_ERROR_STOP=1','-q'], text);
const tiers = { athlete:'Kids & Athletes', supporter:'Supporters', everyday:'Everyday Gear' };
const synthetic = { spreadsheetId:'1nw4BD6Mm0EVYnLG8jJWsZA5LN9WimaU5Pj1T4HaeQmo', retrievedAt:'2026-10-11T18:00:00Z', sheets:{ Summary:[], 'Comparable Brand':[], 'Notes & Sources':[], 'Launch Range':[[],[],[],['SKU','','','','','','','','Launch phase','','MOQ','Supplier cost','','','','Retail price (JMD)'],...previews.map(p=>[p.sku,tiers[p.tier],p.category,p.name,'PRIVATE supplier requirement','PRIVATE creative suggestion','Unapproved sizes','PRIVATE manufacturing',''+p.phase,'PRIVATE compliance',10,25,null,null,null,9000])] } };
// Real source is optional, remains outside the repository and never printed.
const source = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], 'utf8')) : synthetic;
try {
  docker(['run','-d','--rm','--name',container,'-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:17-alpine']);
  for(let i=0;i<60;i++) { if(spawnSync('docker',['exec',container,'pg_isready','-h','127.0.0.1','-U','postgres']).status===0) break; await new Promise(r=>setTimeout(r,250)); }
  sql(`create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql as 'select null::uuid';
create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid,bucket_id text); alter table storage.objects enable row level security;`);
  sql(readFileSync('supabase/schema.sql','utf8'));
  const migrations = readdirSync('supabase/migrations').sort();
  for(const path of migrations.filter(p=>!p.includes('supplier_catalogue'))) sql(readFileSync(`supabase/migrations/${path}`,'utf8'));
  sql(`select public.create_store_order('00000000-0000-4000-8000-000000000099','legacy','legacy-token','Legacy test','legacy@example.invalid','0000000000','pay_on_pickup','pickup','',jsonb_build_array(jsonb_build_object('product_id',(select id from products where not price_is_provisional limit 1),'quantity',1,'size','')));
create table public.test_original_products as select to_jsonb(p) original from public.products p;
create table public.test_original_orders as select * from public.orders;
create table public.test_original_items as select * from public.order_items;
grant usage on schema public,auth to anon,authenticated,service_role;
grant select on public.products to anon;
grant all on all tables in schema public to service_role;
create function public.test_assert(ok boolean, label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; end$$;`);
  for(const path of migrations.filter(p=>p.includes('supplier_catalogue'))) sql(readFileSync(`supabase/migrations/${path}`,'utf8'));
  sql(generateImport(source));
  sql(`create table public.test_import_ids as select catalogue_sku,id from public.products where catalogue_sku is not null;
update public.products set description='Staff edited preview',price_jmd=4321 where catalogue_sku='TF-SW-01';`);
  sql(generateImport(source));
  sql(`do $$begin begin update products set catalogue_sku=null where catalogue_sku='TF-SW-01'; raise exception 'FAILED SKU durability' using errcode='XX000'; exception when raise_exception then null; end; end$$;
select test_assert((select count(*)=94 from products),'28 originals + 66 planned');
select test_assert((select count(*)=66 from catalogue_private.planned_skus),'66 private source rows');
select test_assert((select count(*)=45 from products where launch_phase='Core'),'45 Core');
select test_assert((select count(*)=21 from products where launch_phase='Phase 2' and not is_active),'21 hidden Phase 2');
select test_assert((select count(distinct category)=11 from products where catalogue_sku is not null),'11 categories');
select test_assert((select count(*)=19 from products where catalogue_sku is not null and tier='athlete'),'19 athlete');
select test_assert((select count(*)=17 from products where catalogue_sku is not null and tier='supporter'),'17 supporter');
select test_assert((select count(*)=30 from products where catalogue_sku is not null and tier='everyday'),'30 everyday');
select test_assert((select count(*)=65 from products where catalogue_sku is not null and price_jmd is null),'unknown prices (one staff edit retained)');
select test_assert((select description='Staff edited preview' and price_jmd=4321 from products where catalogue_sku='TF-SW-01'),'reimport preserves staff decisions');
select test_assert(not exists(select 1 from test_import_ids t join products p using(catalogue_sku) where t.id<>p.id),'stable UUIDs on reimport');
select test_assert((select count(*)=28 from test_original_products t join products p on p.id=(t.original->>'id')::uuid where to_jsonb(p)-array['catalogue_sku','launch_phase','availability','public_content_approved','variants_approved']=t.original),'all original content preserved');
select test_assert(not has_schema_privilege('anon','catalogue_private','usage'),'anon cannot access source schema');
select test_assert(not has_schema_privilege('authenticated','catalogue_private','usage'),'browser staff cannot access source schema');
select test_assert(not has_table_privilege('anon','catalogue_private.sources','select'),'anon cannot access workbook');
select test_assert(not has_table_privilege('authenticated','catalogue_private.planned_skus','select'),'authenticated cannot access sourcing');
select test_assert(not has_function_privilege('anon','create_store_order(uuid,text,text,text,text,text,text,text,text,jsonb)','execute'),'no anonymous RPC');
set role anon;
select public.test_assert((select count(*)=73 from products),'RLS exposes only 28 originals + 45 Core previews');
reset role;
create function public.test_order(sku text, key uuid default gen_random_uuid(), hash text default 'hash', size text default '') returns jsonb language sql as $$
select create_store_order(key,hash,'test-token','Test','test@example.invalid','0000000000','pay_on_pickup','pickup','',jsonb_build_array(jsonb_build_object('product_id',(select id from products where catalogue_sku=sku),'quantity',2,'size',size,'unit_price_jmd',1)))$$;
grant execute on function test_order to service_role;
-- Every missing approval is tested independently against the real transaction.
do $$declare gate text; begin
for gate in select unnest(array['price','provisional','availability','content','variants','visibility']) loop
update products set price_jmd=500,price_is_provisional=false,availability='available',public_content_approved=true,variants_approved=true,is_active=true where catalogue_sku='TF-SW-01';
if gate='price' then update products set price_jmd=null where catalogue_sku='TF-SW-01';
elsif gate='provisional' then update products set price_is_provisional=true where catalogue_sku='TF-SW-01';
elsif gate='availability' then update products set availability='planned' where catalogue_sku='TF-SW-01';
elsif gate='content' then update products set public_content_approved=false where catalogue_sku='TF-SW-01';
elsif gate='variants' then update products set variants_approved=false where catalogue_sku='TF-SW-01';
else update products set is_active=false where catalogue_sku='TF-SW-01'; end if;
begin perform test_order('TF-SW-01'); raise exception 'FAILED gate %',gate using errcode='XX000'; exception when raise_exception then null; end;
end loop;
end$$;
select test_assert((select count(*)=1 from orders),'rejected carts create no additional orders');
update products set price_jmd=500,price_is_provisional=false,availability='available',public_content_approved=true,variants_approved=true,is_active=true,sizes=array['S','M'] where catalogue_sku='TF-SW-01';
do $$begin begin perform test_order('TF-SW-01'); raise exception 'FAILED size' using errcode='XX000'; exception when raise_exception then null; end; end$$;
set role service_role;
select test_order('TF-SW-01','00000000-0000-4000-8000-000000000001','hash','M');
reset role;
update products set price_jmd=999,availability='unavailable' where catalogue_sku='TF-SW-01';
select test_order('TF-SW-01','00000000-0000-4000-8000-000000000001','hash','M');
select test_assert((select count(*)=2 from orders),'idempotent retry');
select test_assert(not exists(select * from test_original_orders except select * from orders),'legacy order preserved');
select test_assert(not exists(select * from test_original_items except select * from order_items),'legacy order items preserved');
select test_assert((select subtotal_jmd=1000 from orders where checkout_key='00000000-0000-4000-8000-000000000001'),'server authoritative total');
select test_assert((select unit_price_jmd=500 and size='M' from order_items where order_id=(select id from orders where checkout_key='00000000-0000-4000-8000-000000000001')),'immutable price and size snapshot');
do $$begin begin perform test_order('TF-SW-01','00000000-0000-4000-8000-000000000001','changed','M'); raise exception 'FAILED idempotency hash' using errcode='XX000'; exception when raise_exception then null; end; end$$;`);
  console.log('PASS: counts, idempotent import, original preservation, RLS/privacy, all order gates, size validation, atomic snapshots, idempotent checkout.');
} finally { spawnSync('docker',['rm','-f',container],{stdio:'ignore'}); }
