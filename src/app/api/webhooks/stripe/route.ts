import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 }); }
  if (['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed'].includes(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    const paid = event.type !== 'checkout.session.async_payment_failed' && session.payment_status === 'paid';
    const status = event.type === 'checkout.session.async_payment_failed' ? 'pending' : paid ? 'paid' : 'pending';
    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
    if (session.metadata?.record_type === 'registration' && session.metadata.registration_id) {
      if (paid) {
        const { error } = await supabase.from('registrations').update({ payment_status: status, payment_reference: session.id, registration_status: 'confirmed' }).eq('id', session.metadata.registration_id).not('payment_status', 'in', '(paid,waived,cancelled)');
        if (error) return NextResponse.json({ error: 'Could not save payment.' }, { status: 503 });
      }
    }
    if (session.metadata?.record_type === 'order' && session.metadata.order_id) {
      if (paid) {
        const { data: order, error: readError } = await supabase.from('orders').select('subtotal_jmd,payment_method').eq('id', session.metadata.order_id).single();
        if (readError || !order) return NextResponse.json({ error: 'Order unavailable.' }, { status: 503 });
        if (order.payment_method !== 'stripe' || session.currency !== 'jmd' || session.amount_total !== Math.round(Number(order.subtotal_jmd) * 100)) return NextResponse.json({ error: 'Payment does not match order.' }, { status: 400 });
        const { error } = await supabase.from('orders').update({ payment_status: status, payment_reference: session.id, updated_at: new Date().toISOString() }).eq('id', session.metadata.order_id).not('payment_status', 'in', '(paid,waived,cancelled)');
        if (error) return NextResponse.json({ error: 'Could not save payment.' }, { status: 503 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
