'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { money } from '@/lib/catalogue';
export function CartLines({ editable = false }: { editable?: boolean }) {
  const { cart, update, remove } = useCart();
  return <ul className="divide-y divide-line">{cart.map(item => <li key={item.index} className="py-5 flex gap-4">
    <Link href={`/shop/${item.product.slug || item.product.id}`} className="shrink-0"><Image width={96} height={96} className="object-contain bg-white w-20 h-20" src={item.product.images?.[0] || '/brand-assets/TF_Logo_Dark.png'} alt={item.product.n} /></Link>
    <div className="flex-1"><Link className="font-bold uppercase" href={`/shop/${item.product.slug || item.product.id}`}>{item.product.n}</Link>{item.size && <p className="text-sm">Size: {item.size}</p>}<p className="text-sm text-muted">{money(item.product.p)} each</p>
    {editable ? <div className="flex items-center gap-4 mt-3"><button className="border border-line w-11 h-11" aria-label={`Decrease quantity of ${item.product.n}`} onClick={() => update(item.index, -1)}>−</button><span>{item.quantity}</span><button disabled={item.quantity >= 20} className="border border-line w-11 h-11" aria-label={`Increase quantity of ${item.product.n}`} onClick={() => update(item.index, 1)}>+</button><button className="underline text-sm min-h-11" onClick={() => remove(item.index)}>Remove</button></div> : <p>Quantity: {item.quantity}</p>}
    </div><p className="font-bold">{money(item.product.p * item.quantity)}</p>
  </li>)}</ul>;
}
