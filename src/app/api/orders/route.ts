import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendOrderEmails } from '@/lib/resend';
import { clean, validEmail } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { stripe, stripeEnabled } from '@/lib/stripe';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request: Request) {
  if (!rateLimit(request, 6)) return NextResponse.json({ success: false, error: 'Too many requests. Please wait.' }, { status: 429 });
  const body = await request.json().catch(() => null);
  const reject = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });
  if (!body || !uuid.test(body.checkout_key || '')) return reject('Invalid checkout reference.');
  const customer_name = clean(body.customer_name, 120), email = clean(body.email, 254).toLowerCase(), phone = clean(body.phone, 40);
  const payment_method = clean(body.payment_method, 30), fulfillment_method = clean(body.fulfillment_method, 30), customer_notes = clean(body.customer_notes, 1000);
  if (!customer_name || !validEmail(email) || phone.length < 7) return reject('Enter valid customer contact details.');
  if (!['stripe','bank_transfer','pay_on_pickup'].includes(payment_method) || !['pickup','delivery_coordination'].includes(fulfillment_method)) return reject('Select valid payment and fulfillment methods.');
  if (payment_method === 'stripe' && (!stripeEnabled || !stripe)) return reject('Online payment is unavailable. Choose another payment method.');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) return reject('Your cart must contain 1–30 items.');
  const items: { product_id: string; quantity: number; size: string }[] = [];
  for (const row of body.items) {
    if (!row || !uuid.test(row.product_id || '') || !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 20) return reject('Invalid cart item.');
    const size = clean(row.size, 40);
    if (items.some(item => item.product_id === row.product_id && item.size === size)) return reject('Duplicate cart items.');
    items.push({ product_id: row.product_id, quantity: row.quantity, size });
  }
  items.sort((a, b) => (a.product_id + a.size).localeCompare(b.product_id + b.size));
  const supabase = getServiceSupabase();
  if (!supabase) return reject('Ordering service is unavailable.', 503);
  const hash = createHash('sha256').update(JSON.stringify({ customer_name, email, phone, payment_method, fulfillment_method, customer_notes, items })).digest('hex');
  const { data: saved, error } = await supabase.rpc('create_store_order', { p_key: body.checkout_key, p_hash: hash, p_token: randomBytes(32).toString('hex'), p_name: customer_name, p_email: email, p_phone: phone, p_payment: payment_method, p_fulfillment: fulfillment_method, p_notes: customer_notes, p_items: items });
  if (error || !saved) return reject(error?.code === 'P0001' ? error.message : 'Could not safely save your order. Please retry with the same checkout details.', error?.code === 'P0001' ? 409 : 503);
  const { data: order, error: readError } = await supabase.from('orders').select('id,customer_name,email,subtotal_jmd,payment_method,order_items(*)').eq('id', saved.id).single();
  if (readError || !order) return reject('Order saved, but its receipt could not load. Retry with the same details.', 503);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const receiptUrl = `${origin}/orders/${saved.id}?token=${saved.token}`;
  let checkoutUrl: string | null = null, checkoutError: string | null = null;
  if (payment_method === 'stripe' && stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment', customer_email: email,
        line_items: order.order_items.map((item: { quantity: number; unit_price_jmd: number; product_name: string; size: string }) => ({ quantity: item.quantity, price_data: { currency: 'jmd', unit_amount: Math.round(Number(item.unit_price_jmd) * 100), product_data: { name: item.product_name + (item.size ? ` — ${item.size}` : '') } } })),
        metadata: { record_type: 'order', order_id: saved.id },
        success_url: receiptUrl + '&payment=returned', cancel_url: receiptUrl + '&payment=cancelled',
      }, { idempotencyKey: `order-${saved.id}` });
      const { error: referenceError } = await supabase.from('orders').update({ payment_reference: session.id }).eq('id', saved.id);
      if (referenceError) throw new Error('Payment reference could not be saved');
      checkoutUrl = session.url;
    } catch { checkoutError = 'Your order is saved, but online payment could not start. Keep your reference and contact the team before paying.'; }
  }
  let message = 'Order saved. Payment and fulfillment are confirmed separately.';
  if (!saved.reused) {
    const result = await sendOrderEmails({ ...order, subtotal_jmd: Number(order.subtotal_jmd), receiptUrl });
    if (!result.success) message += ' Confirmation email could not be sent; keep your receipt link.';
  }
  return NextResponse.json({ success: true, message, data: { id: saved.id, receiptUrl, checkoutUrl, checkoutError } });
}
