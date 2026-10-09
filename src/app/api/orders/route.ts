import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendOrderEmails } from '@/lib/resend';
import { clean, validEmail } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { stripe, stripeEnabled } from '@/lib/stripe';

export async function POST(request: Request) {
  if (!rateLimit(request, 6)) return NextResponse.json({ success: false, error: 'Too many requests. Please wait.' }, { status: 429 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  const customer_name = clean(body.customer_name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const payment_method = clean(body.payment_method, 30);
  const fulfillment_method = clean(body.fulfillment_method, 30);
  const items = Array.isArray(body.items) ? body.items.slice(0, 30) as Array<Record<string, unknown>> : [];
  if (!customer_name || !validEmail(email) || phone.length < 7) return NextResponse.json({ success: false, error: 'Enter valid customer contact details.' }, { status: 400 });
  if (!['stripe','bank_transfer','pay_on_pickup'].includes(payment_method)) return NextResponse.json({ success: false, error: 'Select a valid payment method.' }, { status: 400 });
  if (!['pickup','delivery_coordination'].includes(fulfillment_method)) return NextResponse.json({ success: false, error: 'Select a fulfillment method.' }, { status: 400 });
  if (!items.length) return NextResponse.json({ success: false, error: 'Your cart is empty.' }, { status: 400 });
  if (payment_method === 'stripe' && (!stripeEnabled || !stripe)) return NextResponse.json({ success: false, error: 'Online payment is unavailable. Choose another payment method.' }, { status: 400 });
  const quantities = new Map<string, number>();
  for (const item of items) {
    const id = clean(item.product_id, 80); const quantity = Number(item.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return NextResponse.json({ success: false, error: 'Invalid cart item.' }, { status: 400 });
    quantities.set(id, Math.min(20, (quantities.get(id) || 0) + quantity));
  }
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ success: false, error: 'Ordering service is unavailable.' }, { status: 503 });
  const ids = Array.from(quantities.keys());
  const { data: products, error: productError } = await supabase.from('products').select('id,name,price_jmd,price_is_provisional').in('id', ids).eq('is_active', true);
  if (productError || !products || products.length !== ids.length) return NextResponse.json({ success: false, error: 'One or more products are unavailable. Refresh the store.' }, { status: 409 });
  if (products.some((product) => product.price_is_provisional)) return NextResponse.json({ success: false, error: 'These products are previews with provisional prices. Contact us to confirm pricing before ordering.' }, { status: 409 });
  const orderItems = products.map((p) => ({ product_id: p.id, product_name: p.name, quantity: quantities.get(p.id)!, unit_price_jmd: Number(p.price_jmd) }));
  const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price_jmd * item.quantity, 0);
  const { data: order, error: orderError } = await supabase.from('orders').insert({ customer_name, email, phone, subtotal_jmd: subtotal, payment_method, payment_status: payment_method === 'bank_transfer' ? 'manual_verification' : 'pending', payment_provider: payment_method === 'stripe' ? 'stripe' : null, fulfillment_method }).select('id').single();
  if (orderError || !order) return NextResponse.json({ success: false, error: 'Could not safely save your order.' }, { status: 500 });
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ success: false, error: 'Could not safely save your order items.' }, { status: 500 });
  }
  const emailResult = await sendOrderEmails({ id: order.id, customer_name, email, subtotal_jmd: subtotal, payment_method });
  let checkoutUrl: string | null = null;
  let checkoutError: string | null = null;
  if (payment_method === 'stripe' && stripe) {
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment', customer_email: email,
        line_items: orderItems.map((item) => ({ quantity: item.quantity, price_data: { currency: 'jmd', unit_amount: Math.round(item.unit_price_jmd * 100), product_data: { name: item.product_name } } })),
        metadata: { record_type: 'order', order_id: order.id },
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?order=${order.id}&payment=cancelled#shop`,
        integration_identifier: `triplefins_${randomBytes(4).toString('hex')}`,
      });
      checkoutUrl = session.url;
      await supabase.from('orders').update({ payment_reference: session.id }).eq('id', order.id);
    } catch (err) {
      console.error('[Stripe order checkout]', err);
      checkoutError = 'Order saved, but checkout could not start. Contact us to complete payment.';
    }
  }
  await supabase.from('analytics_events').insert({ event_name: 'order_completed', metadata: { payment_method, subtotal_jmd: subtotal } });
  return NextResponse.json({ success: true, message: emailResult.success ? 'Order saved.' : 'Order saved, but confirmation email failed.', data: { id: order.id, checkoutUrl, checkoutError } });
}
