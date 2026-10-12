'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { CartLines } from '@/components/CartLines';
import { StoreShell } from '@/components/StoreShell';
import { canOrder, cartSubtotal, money } from '@/lib/catalogue';
export default function CartPage() {
  const { cart, ready } = useCart();
  return <StoreShell><div className="wrap py-16"><p className="eyebrow">Your selection</p><h1 className="text-5xl uppercase font-bold text-deep">Shopping cart</h1>
    {!ready ? <p className="mt-8" role="status">Loading cart…</p> : !cart.length ? <div className="py-12"><p>Your cart is empty. Find your team colours in the store.</p><Link className="btn btn-sun mt-6" href="/shop">Explore the collection</Link></div> : <div className="grid lg:grid-cols-[1fr_320px] gap-10 mt-8"><CartLines editable /><aside className="bg-white border border-line p-6 h-fit"><h2 className="text-2xl font-bold">Order summary</h2><p className="flex justify-between my-6"><span>Subtotal</span><strong>{money(cartSubtotal(cart))}</strong></p><p className="text-sm text-muted mb-6">Final merchandise prices are verified at checkout. Pickup or delivery coordination; delivery fees are confirmed separately.</p><Link className="btn btn-sun w-full" href="/checkout">Review checkout</Link><Link className="block underline mt-5" href="/shop">Continue shopping</Link></aside></div>}
  </div></StoreShell>;
}
