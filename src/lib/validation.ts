import { RegistrationSubmission } from '@/types';

export const clean = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const validEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

export function validateRegistration(input: unknown):
  | { ok: true; data: RegistrationSubmission }
  | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Invalid request.' };
  const body = input as Record<string, unknown>;
  const program = clean(body.program_type, 40);
  const payment = clean(body.payment_method, 40);
  const level = clean(body.swimming_level, 40);
  const age = body.participant_age === '' || body.participant_age == null ? undefined : Number(body.participant_age);
  const data = {
    program_type: program,
    participant_name: clean(body.participant_name, 120),
    participant_age: age,
    parent_name: clean(body.parent_name, 120) || undefined,
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 40),
    swimming_level: level,
    medical_notes: clean(body.medical_notes, 1000) || undefined,
    preferred_session: clean(body.preferred_session, 120) || undefined,
    consent: body.consent === true,
    payment_method: payment,
  } as RegistrationSubmission;
  if (!['sunday_swim', 'summer_camp', 'private_coaching'].includes(program)) return { ok: false, error: 'Select a valid program.' };
  if (!data.participant_name) return { ok: false, error: 'Swimmer name is required.' };
  if (age !== undefined && (!Number.isInteger(age) || age < 2 || age > 100)) return { ok: false, error: 'Enter a valid swimmer age.' };
  if (!validEmail(data.email)) return { ok: false, error: 'Enter a valid email address.' };
  if (data.phone.length < 7) return { ok: false, error: 'Enter a valid phone or WhatsApp number.' };
  if (!['beginner', 'intermediate', 'advanced'].includes(level)) return { ok: false, error: 'Select a swimming level.' };
  if (!['stripe', 'bank_transfer', 'pay_on_site'].includes(payment)) return { ok: false, error: 'Select a payment method.' };
  if (!data.consent) return { ok: false, error: 'Consent is required to register.' };
  return { ok: true, data };
}

export const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char] || char));
