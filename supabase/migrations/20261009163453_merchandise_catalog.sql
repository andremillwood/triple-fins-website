alter table public.products
 add column if not exists slug text,
 add column if not exists description text not null default '',
 add column if not exists image_urls text[] not null default '{}',
 add column if not exists price_is_provisional boolean not null default false;
create unique index if not exists products_slug_idx on public.products(slug);
alter table public.products add constraint products_nonnegative_price check (price_jmd >= 0);
create policy "Staff manage products" on public.products for all to authenticated
using (exists(select 1 from public.staff_roles where user_id = (select auth.uid())))
with check (exists(select 1 from public.staff_roles where user_id = (select auth.uid())));
grant select, insert, update on public.products to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "Staff upload product images" on storage.objects for insert to authenticated
with check (bucket_id='product-images' and exists(select 1 from public.staff_roles where user_id=(select auth.uid())));
create policy "Public read product images" on storage.objects for select to anon,authenticated
using (bucket_id='product-images');
insert into public.products(slug,name,category,tier,price_jmd,description,image_url,image_urls,price_is_provisional,sort_order) values
('duffle','Team Jamaica Duffle Bag','Bags','everyday',6500,'Carry your swim-day essentials with bold Team Jamaica graphics, green handles and Triple Fins identity.','/images/products/duffle-1.webp',ARRAY['/images/products/duffle-1.webp'],true,20),
('tracksuit','Team Jamaica Tracksuit','Tracksuit','athlete',12000,'A coordinated black jacket and trousers with yellow panels and green trim for a unified team look.','/images/products/tracksuit-1.webp',ARRAY['/images/products/tracksuit-1.webp'],true,21),
('drawstring','Triple Fins Drawstring Bag','Bags','everyday',2500,'An easy grab-and-go bag with green cords, geometric Jamaican colours and Triple Fins branding.','/images/products/drawstring-1.webp',ARRAY['/images/products/drawstring-1.webp'],true,22),
('polo','Team Jamaica Black Polo','Polo','supporter',4500,'A clean black collared polo with Team Jamaica and Triple Fins chest graphics for coaches and supporters.','/images/products/polo-1.webp',ARRAY['/images/products/polo-1.webp'],true,23),
('parka','Team Jamaica Green Parka','Outerwear','athlete',9500,'Stand out poolside in a hooded green design with yellow accents and vertical Team Jamaica graphics.','/images/products/parka-1.webp',ARRAY['/images/products/parka-1.webp','/images/products/parka-2.webp'],true,24),
('hummingbird-black','Hummingbird Team Tee — Black','T-Shirt','athlete',3800,'A green hummingbird takes flight across a patterned black tee, finished with green trim and Outta Many lettering on the back.','/images/products/hummingbird-black-1.webp',ARRAY['/images/products/hummingbird-black-1.webp','/images/products/hummingbird-black-2.webp'],true,25),
('hummingbird-green','Hummingbird Team Tee — Green','T-Shirt','athlete',3800,'Jamaican green and yellow frame a bold hummingbird illustration, with Team Jamaica graphics and an Outta Many back print.','/images/products/hummingbird-green-1.webp',ARRAY['/images/products/hummingbird-green-1.webp','/images/products/hummingbird-green-2.webp'],true,26),
('hummingbird-yellow','Hummingbird Team Tee — Yellow','T-Shirt','athlete',3800,'A bright yellow hummingbird design with green trim, subtle all-over pattern and matching Team Jamaica back artwork.','/images/products/hummingbird-yellow-1.webp',ARRAY['/images/products/hummingbird-yellow-1.webp','/images/products/hummingbird-yellow-2.webp'],true,27),
('year-one-black-white','Year One Tee — Black / White','T-Shirt','supporter',3500,'A tonal abstract pattern meets crisp white Team Jamaica lettering and an aqua Triple Fins chest mark.','/images/products/year-one-black-white-1.webp',ARRAY['/images/products/year-one-black-white-1.webp'],true,28),
('year-one-black-colour','Year One Tee — Black / Jamaica','T-Shirt','supporter',3500,'A black abstract-pattern tee featuring Team Jamaica lettering in green and yellow with the aqua Triple Fins emblem.','/images/products/year-one-black-colour-1.webp',ARRAY['/images/products/year-one-black-colour-1.webp'],true,29),
('year-one-yellow','Year One Tee — Yellow / Black','T-Shirt','supporter',3500,'A sweeping yellow panel and abstract pattern contrast with black sleeves and a diagonal Team Jamaica mark.','/images/products/year-one-yellow-1.webp',ARRAY['/images/products/year-one-yellow-1.webp'],true,30),
('year-one-green','Year One Tee — Green','T-Shirt','supporter',3500,'A green abstract-pattern design with yellow collar detail and a bold Team Jamaica chest graphic.','/images/products/year-one-green-1.webp',ARRAY['/images/products/year-one-green-1.webp'],true,31)
on conflict (slug) do nothing;
