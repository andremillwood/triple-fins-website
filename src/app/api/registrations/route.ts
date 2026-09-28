import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendRegistrationEmails } from '@/lib/resend';
import { rateLimit } from '@/lib/rateLimit';
import { stripe, stripeEnabled } from '@/lib/stripe';
import { validateRegistration } from '@/lib/validation';

const prices: Record<string, number> = {
  sunday_swim: Number(process.env.SUNDAY_SWIM_PRICE_JMD || 0),
  summer_camp: Number(process.env.SUMMER_CAMP_PRICE_JMD || 0),
  private_coaching: Number(process.env.PRIVATE_COACHING_PRICE_JMD || 0),
};

export async function POST(request: Request) {
  if (!rateLimit(request, 6)) return NextResponse.json({ success: false, error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 }); }
  const validated = validateRegistration(body);
  if (!validated.ok) return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  const registration = validated.data;
  if (registration.payment_method === 'stripe' && (!stripeEnabled || !stripe)) {
    return NextResponse.json({ success: false, error: 'Online payment is temporarily unavailable. Choose bank transfer or pay on site.' }, { status: 400 });
  }
  const amount = prices[registration.program_type];
  if (registration.payment_method === 'stripe' && (!Number.isFinite(amount) || amount <= 0)) {
    return NextResponse.json({ success: false, error: 'Online pricing is not configured for this program.' }, { status: 503 });
  }
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ success: false, error: 'Registration service is unavailable. Please contact us by phone.' }, { status: 503 });

  const { data, error } = await supabase.from('registrations').insert({
    program_type: registration.program_type,
    participant_name: registration.participant_name,
    participant_age: registration.participant_age,
    parent_name: registration.parent_name,
    email: registration.email,
    phone: registration.phone,
    swimming_level: registration.swimming_level,
    medical_notes: registration.medical_notes,
    preferred_session: registration.preferred_session,
    payment_method: registration.payment_method,
    consent_at: new Date().toISOString(),
    payment_status: registration.payment_method === 'bank_transfer' ? 'manual_verification' : 'pending',
    payment_provider: registration.payment_method === 'stripe' ? 'stripe' : null,
    amount_jmd: amount || null,
    registration_status: 'new',
  }).select('id').single();
  if (error || !data) {
    console.error('[Registration insert]', error);
    return NextResponse.json({ success: false, error: 'We could not safely save this registration. Please try again.' }, { status: 500 });
  }

  const email = await sendRegistrationEmails(registration, data.id);
  let checkoutUrl: string | null = null;
  let checkoutError: string | null = null;
  if (registration.payment_method === 'stripe' && stripe) {
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: registration.email,
        line_items: [{ quantity: 1, price_data: { currency: 'jmd', unit_amount: Math.round(amount * 100), product_data: { name: `Triple Fins — ${registration.program_type.replaceAll('_', ' ')}` } } }],
        metadata: { record_type: 'registration', registration_id: data.id },
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?registration=${data.id}&payment=cancelled#register`,
        integration_identifier: `triplefins_${randomBytes(4).toString('hex')}`,
      });
      checkoutUrl = session.url;
      await supabase.from('registrations').update({ payment_reference: session.id }).eq('id', data.id);
    } catch (err) {
      console.error('[Stripe registration checkout]', err);
      checkoutError = 'Registration saved, but online checkout could not start. Please contact us to complete payment.';
    }
  }
  await supabase.from('analytics_events').insert({ event_name: 'registration_completed', metadata: { program_type: registration.program_type, payment_method: registration.payment_method } });
  return NextResponse.json({ success: true, message: email.success ? 'Registration saved.' : 'Registration saved, but the confirmation email could not be sent.', data: { id: data.id, emailSent: email.success, checkoutUrl, checkoutError } });
}
