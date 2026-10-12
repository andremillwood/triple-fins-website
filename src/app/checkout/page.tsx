'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { CartLines } from '@/components/CartLines';
import { StoreShell } from '@/components/StoreShell';
import { canOrder, cartSubtotal, money } from '@/lib/catalogue';
export default function CheckoutPage() {
  const { cart, ready, clear } = useCart(); const locked = useRef(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [stripeEnabled, setStripeEnabled] = useState(false);
  useEffect(() => { fetch('/api/config').then(response => response.json()).then(data => setStripeEnabled(!!data.stripeEnabled)).catch(() => {}); }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (locked.current) return; if (cart.some(item => !canOrder(item.product))) { setError('Remove unavailable items before ordering.'); return; } locked.current = true; setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    const payload = { customer_name: form.get('customer_name'), email: form.get('email'), phone: form.get('phone'), payment_method: form.get('payment_method'), fulfillment_method: form.get('fulfillment_method'), customer_notes: form.get('customer_notes'), items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity, size: item.size || '' })) };
    try {
      const fingerprint = JSON.stringify(payload);
      let attempt = JSON.parse(sessionStorage.getItem('tf_checkout') || 'null');
      if (!attempt || attempt.fingerprint !== fingerprint) { attempt = { fingerprint, key: crypto.randomUUID() }; sessionStorage.setItem('tf_checkout', JSON.stringify(attempt)); }
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, checkout_key: attempt.key }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Checkout failed. Your cart has been kept.');
      sessionStorage.setItem('tf_order_message', result.data.checkoutError || result.message);
      // Clear only once the order and all its items are durably saved.
      clear(); sessionStorage.removeItem('tf_checkout');
      window.location.assign(result.data.checkoutUrl || result.data.receiptUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not connect. Your cart has been kept.'); locked.current = false; setBusy(false); }
  }
  const input = 'block w-full bg-white border border-line p-3 mt-2';
  return <StoreShell><div className="wrap py-16"><Link href="/cart" className="underline">← Back to cart</Link><h1 className="text-5xl uppercase font-bold text-deep mt-6">Checkout</h1>
    {!ready ? <p role="status">Loading cart…</p> : !cart.length ? <p className="mt-8">Your cart is empty. <Link className="underline" href="/shop">Browse products</Link></p> : <div className="grid lg:grid-cols-2 gap-12 mt-8">
      <form onSubmit={submit} className="space-y-5"><h2 className="font-bold text-2xl">Contact & collection</h2><label className="block">Full name<input autoComplete="name" name="customer_name" required maxLength={120} className={input} /></label><label className="block">Email<input autoComplete="email" name="email" type="email" required maxLength={254} className={input} /></label><label className="block">Phone<input autoComplete="tel" name="phone" type="tel" required minLength={7} maxLength={40} className={input} /></label>
        <label className="block">Fulfillment<select name="fulfillment_method" className={input}><option value="pickup">Pickup — team will confirm time and location</option><option value="delivery_coordination">Coordinate delivery with the team</option></select></label>
        <label className="block">Notes / delivery address<textarea name="customer_notes" maxLength={1000} rows={3} className={input} /></label>
        <label className="block">Payment<select name="payment_method" className={input}><option value="pay_on_pickup">Pay on pickup</option><option value="bank_transfer">Bank transfer — details supplied by the team</option>{stripeEnabled && <option value="stripe">Secure card payment with Stripe</option>}</select></label>
        <p className="text-sm text-muted">{stripeEnabled ? 'Card payments open secure Stripe Checkout.' : 'Online card payment is not available yet.'} For bank transfer, wait for verified account instructions and use your order reference. No transfer is marked paid until staff verify it.</p>
        <p className="text-sm text-muted">Merchandise subtotal only. Delivery fees, timing and availability are confirmed with you before dispatch.</p>
        {error && <p role="alert" className="bg-rose-50 text-rose-800 p-4">{error}</p>}<button disabled={busy || cart.some(item => !canOrder(item.product))} className="btn btn-sun w-full">{busy ? 'Saving your order…' : 'Place order'}</button>
      </form><aside className="bg-foam p-6 h-fit"><h2 className="font-bold text-2xl">Your order</h2><CartLines /><p className="border-t border-line pt-5 flex justify-between"><span>Subtotal</span><strong>{money(cartSubtotal(cart))}</strong></p><p className="text-sm mt-4">Prices and available sizes are verified again when you order.</p></aside>
    </div>}
  </div></StoreShell>;
}
