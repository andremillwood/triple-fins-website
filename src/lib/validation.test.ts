import { describe, expect, it } from 'vitest';
import { escapeHtml, validateRegistration } from './validation';

const valid = { program_type: 'sunday_swim', participant_name: 'Ari Brown', participant_age: 9, parent_name: 'Sam Brown', email: 'sam@example.com', phone: '876-555-1234', swimming_level: 'beginner', consent: true, payment_method: 'stripe' };

describe('registration validation', () => {
  it('accepts a complete registration', () => expect(validateRegistration(valid).ok).toBe(true));
  it('rejects missing consent', () => expect(validateRegistration({ ...valid, consent: false })).toEqual({ ok: false, error: 'Consent is required to register.' }));
  it('rejects unknown payment methods', () => expect(validateRegistration({ ...valid, payment_method: 'cash_app' }).ok).toBe(false));
  it('rejects invalid age', () => expect(validateRegistration({ ...valid, participant_age: 1 }).ok).toBe(false));
});

describe('email HTML escaping', () => {
  it('escapes user supplied markup', () => expect(escapeHtml('<img src=x onerror="x">')).toBe('&lt;img src=x onerror=&quot;x&quot;&gt;'));
});
