'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreShell } from '@/components/StoreShell';
import { money } from '@/lib/catalogue';
type Receipt = { id: string; subtotal_jmd: number; payment_method: string; payment_status: string; fulfillment_status: string; fulfillment_method: string; order_items: { product_name: string; size: string; quantity: number; unit_price_jmd: number }[] };
export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Receipt | null>(null), [error, setError] = useState(''), [message, setMessage] = useState('');
  const load = useCallback(async () => {
    setError('');
    try { const token = new URLSearchParams(window.location.search).get('token') || ''; const response = await fetch(`/api/orders/${params.id}?token=${encodeURIComponent(token)}`, { cache: 'no-store' }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setOrder(result.data); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load receipt.'); }
  }, [params.id]);
  useEffect(() => { load(); setMessage(sessionStorage.getItem('tf_order_message') || ''); sessionStorage.removeItem('tf_order_message'); }, [load]);
  return <StoreShell><div className="wrap py-16 max-w-3xl"><p className="eyebrow">Order receipt</p><h1 className="text-4xl font-bold uppercase text-deep">{order ? 'Your order is saved' : 'Your Triple Fins order'}</h1>
    {error ? <p role="alert" className="mt-8">{error}</p> : !order ? <p role="status" className="mt-8">Loading receipt…</p> : <>
      {message && <p role="status" className="p-4 bg-foam mt-6">{message}</p>}<p className="mt-6 break-all">Reference: <strong>{order.id}</strong></p><p className="text-sm text-muted mt-2">Keep this private receipt link to check your order. It is not proof of payment.</p>
      <div className="grid sm:grid-cols-2 gap-4 mt-6"><div className="p-5 bg-white border border-line"><h2 className="font-bold">Payment</h2><p>{order.payment_status.replaceAll('_', ' ')}</p><p className="text-sm text-muted">{order.payment_method.replaceAll('_', ' ')}</p></div><div className="p-5 bg-white border border-line"><h2 className="font-bold">Fulfillment</h2><p>{order.fulfillment_status.replaceAll('_', ' ')}</p><p className="text-sm text-muted">{order.fulfillment_method.replaceAll('_', ' ')}</p></div></div>
      <ul className="divide-y divide-line my-6">{order.order_items.map((item, index) => <li key={index} className="py-4 flex justify-between gap-4"><span>{item.quantity} × {item.product_name}{item.size && ` — ${item.size}`}</span><strong>{money(Number(item.unit_price_jmd) * item.quantity)}</strong></li>)}</ul><p className="text-xl font-bold">Merchandise subtotal: {money(Number(order.subtotal_jmd))}</p>
      <p className="mt-6">{order.payment_status === 'paid' ? 'Payment confirmed. The team will coordinate fulfillment.' : order.payment_method === 'bank_transfer' ? 'Wait for verified bank account instructions from Triple Fins. Include your order reference with the transfer; staff will confirm receipt.' : order.payment_method === 'stripe' ? 'Your payment is not yet confirmed. If you completed Stripe Checkout, refresh shortly. If payment was cancelled or could not start, contact the team with this reference before paying again.' : 'Payment is due on pickup. The team will confirm availability, collection time and location.'}</p><p className="mt-4">Delivery fees and arrangements, where applicable, will be agreed separately.</p>
      <button className="btn btn-deep mt-6" onClick={load}>Refresh status</button>
    </>}<div className="flex gap-4 flex-wrap mt-8"><Link className="btn btn-sun" href="/shop">Continue shopping</Link><Link className="btn btn-outline" href="/#contact">Contact the team</Link></div>
  </div></StoreShell>;
}
