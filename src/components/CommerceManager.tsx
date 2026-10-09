'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductGallery } from './ProductGallery';

type EditableProduct = { id?: string; name: string; description: string; category: string; tier: string; price_jmd: number; is_active: boolean; price_is_provisional: boolean; sort_order: number; image_url: string; image_urls: string[] };
type Order = { id: string; customer_name: string; email: string; phone: string; subtotal_jmd: number; payment_method: string; payment_status: string; fulfillment_method: string; fulfillment_status: string; created_at: string; order_items: {id: string; product_name: string; quantity: number; unit_price_jmd: number}[] };
const blank: EditableProduct = {name:'', description:'', category:'T-Shirt', tier:'athlete', price_jmd:0, is_active:false, price_is_provisional:true, sort_order:0, image_url:'', image_urls:[]};
export function CommerceManager() {
 const [products,setProducts] = useState<EditableProduct[]>([]);
 const [orders,setOrders] = useState<Order[]>([]);
 const [edit,setEdit] = useState<EditableProduct|null>(null);
 const [message,setMessage] = useState('');
 const [busy,setBusy] = useState(false);
 const load = useCallback(async()=>{
  if(!supabase) return;
  const [p,o] = await Promise.all([supabase.from('products').select('*').order('sort_order'),supabase.from('orders').select('*,order_items(*)').order('created_at',{ascending:false}).limit(200)]);
  if(p.error||o.error) {setMessage('Could not load store records. Check that the merchandise migrations are applied.');return;}
  setProducts(p.data||[]);setOrders(o.data||[]);
 },[]);
 useEffect(()=>{load();},[load]);
 const save = async(event: React.FormEvent)=>{
  event.preventDefault();if(!supabase||!edit||busy)return;setBusy(true);setMessage('');
  const {id,...values}=edit;
  const images=values.image_urls.map(url=>url.trim()).filter(Boolean);
  if(images.some(url=>!url.startsWith('/images/')&&!/^https:\/\//.test(url))){setBusy(false);setMessage('Use local /images/ paths or HTTPS image URLs.');return;}
  const payload={...values,name:values.name.trim(),image_url:images[0]||null,image_urls:images};
  const result=id?await supabase.from('products').update(payload).eq('id',id).select('id').single():await supabase.from('products').insert(payload).select('id').single();
  setBusy(false);
  if(result.error){setMessage('Product could not be saved: '+result.error.message);return;}
  setEdit(null);setMessage('Product saved.');await load();
 };
 const status = async(id:string,field:string,value:string)=>{
  if(!supabase)return;setBusy(true);
  const {error}=await supabase.from('orders').update({[field]:value,updated_at:new Date().toISOString()}).eq('id',id).select('id').single();
  setMessage(error?'Order update failed.':'Order updated.');setBusy(false);await load();
 };
 const input='w-full border border-line p-2 bg-white';
 const upload = async(file:File|undefined)=>{
  if(!file||!supabase||!edit||busy)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5242880){setMessage('Choose a JPEG, PNG or WebP image under 5 MB.');return;}
  setBusy(true);
  const extension=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
  const path=crypto.randomUUID()+'.'+extension;
  const {error}=await supabase.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});
  if(error)setMessage('Image upload failed: '+error.message);
  else {const {data}=supabase.storage.from('product-images').getPublicUrl(path);setEdit(current=>current?{...current,image_urls:[...current.image_urls,data.publicUrl]}:current);setMessage('Image uploaded. Save the product to attach it.');}
  setBusy(false);
 };
 return <section className="mb-8 space-y-6">
 <div className="flex justify-between items-center gap-4"><h2 className="font-bold uppercase text-2xl text-deep">Store Management</h2><button className="btn btn-sun btn-sm" onClick={()=>setEdit({...blank})}>Add product</button></div>
 <p role="status" className="text-sm">{message}</p>
 {edit&&<form onSubmit={save} className="bg-white p-5 grid sm:grid-cols-2 gap-4">
 <h3 className="sm:col-span-2 font-bold text-xl">{edit.id?'Edit product':'New product'}</h3>
 <label>Product name<input required maxLength={160} className={input} value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})}/></label>
 <label>Category<input required className={input} value={edit.category} onChange={e=>setEdit({...edit,category:e.target.value})}/></label>
 <label className="sm:col-span-2">Description<textarea className={input} rows={3} value={edit.description} onChange={e=>setEdit({...edit,description:e.target.value})}/></label>
 <label>Price (JMD)<input required type="number" min="0" step="0.01" className={input} value={edit.price_jmd} onChange={e=>setEdit({...edit,price_jmd:Number(e.target.value)})}/></label>
 <label>Display order<input type="number" className={input} value={edit.sort_order} onChange={e=>setEdit({...edit,sort_order:Number(e.target.value)})}/></label>
 <label>Collection<select className={input} value={edit.tier} onChange={e=>setEdit({...edit,tier:e.target.value})}><option value="athlete">Athlete</option><option value="supporter">Supporter</option><option value="everyday">Everyday</option></select></label>
 <div className="space-y-2"><label className="block"><input type="checkbox" checked={edit.is_active} onChange={e=>setEdit({...edit,is_active:e.target.checked})}/> Visible in store</label><label className="block"><input type="checkbox" checked={edit.price_is_provisional} onChange={e=>setEdit({...edit,price_is_provisional:e.target.checked})}/> Provisional price (checkout disabled)</label></div>
 <label className="sm:col-span-2">Gallery image paths / HTTPS URLs (one per line, main image first)<textarea className={input} rows={4} value={edit.image_urls.join('\n')} onChange={e=>setEdit({...edit,image_urls:e.target.value.split('\n')})}/></label>
 <label className="sm:col-span-2">Upload a product image<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" className={input} onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/></label>
 <p className="sm:col-span-2 text-sm text-muted">Uncheck provisional pricing only after approving the selling price. Hide products instead of deleting them to preserve order history.</p>
 <div className="flex gap-3 sm:col-span-2"><button disabled={busy} className="btn btn-sun">{busy?'Saving…':'Save product'}</button><button type="button" className="btn btn-deep" onClick={()=>setEdit(null)}>Cancel</button></div>
 </form>}
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{products.map(p=><article key={p.id} className="bg-white border border-line"><ProductGallery name={p.name} images={p.image_urls?.length?p.image_urls:p.image_url?[p.image_url]:[]}/><div className="p-4"><h3 className="font-bold">{p.name}</h3><p>JMD $ {Number(p.price_jmd).toLocaleString()}</p><p className="text-xs text-muted">{p.is_active?'Visible':'Hidden'} · {p.price_is_provisional?'Provisional':'Approved price'}</p><button className="btn btn-deep btn-sm mt-3" onClick={()=>setEdit({id:p.id,name:p.name,description:p.description||'',category:p.category,tier:p.tier,price_jmd:Number(p.price_jmd),is_active:p.is_active,price_is_provisional:p.price_is_provisional,sort_order:p.sort_order,image_url:p.image_url||'',image_urls:p.image_urls?.length?p.image_urls:p.image_url?[p.image_url]:[]})}>Edit product</button></div></article>)}</div>
 <h2 className="font-bold uppercase text-2xl text-deep">Merchandise Orders</h2>
 {!orders.length&&<p className="bg-white p-4">No orders yet.</p>}
 <div className="space-y-4">{orders.map(o=><article key={o.id} className="bg-white p-5 border border-line"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{o.customer_name}</h3><p className="text-sm">{o.email} · {o.phone}</p><p className="text-xs text-muted">Reference {o.id} · {new Date(o.created_at).toLocaleDateString()}</p></div><p className="font-bold">JMD $ {Number(o.subtotal_jmd).toLocaleString()}</p></div><ul className="my-3 text-sm">{o.order_items.map(i=><li key={i.id}>{i.quantity} × {i.product_name} · JMD $ {Number(i.unit_price_jmd).toLocaleString()} each</li>)}</ul><p className="text-sm mb-3">{o.payment_method} · {o.fulfillment_method}</p><div className="flex flex-wrap gap-4"><label>Payment<select disabled={busy} className={input} value={o.payment_status} onChange={e=>status(o.id,'payment_status',e.target.value)}>{['pending','manual_verification','paid','waived','cancelled'].map(s=><option key={s}>{s}</option>)}</select></label><label>Fulfillment<select disabled={busy} className={input} value={o.fulfillment_status} onChange={e=>status(o.id,'fulfillment_status',e.target.value)}>{['new','coordinating','ready','fulfilled','cancelled'].map(s=><option key={s}>{s}</option>)}</select></label></div></article>)}</div>
 </section>;
}
