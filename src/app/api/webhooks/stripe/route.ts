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
    const paid = event.type !== 'checkout.session.async_payment_failed' && session.payment_status !== 'unpaid';
    const status = event.type === 'checkout.session.async_payment_failed' ? 'pending' : paid ? 'paid' : 'pending';
    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
    if (session.metadata?.record_type === 'registration' && session.metadata.registration_id) {
      await supabase.from('registrations').update({ payment_status: status, payment_reference: session.id, registration_status: paid ? 'confirmed' : 'new' }).eq('id', session.metadata.registration_id);
    }
    if (session.metadata?.record_type === 'order' && session.metadata.order_id) {
      await supabase.from('orders').update({ payment_status: status, payment_reference: session.id }).eq('id', session.metadata.order_id);
    }
  }
  return NextResponse.json({ received: true });
}
