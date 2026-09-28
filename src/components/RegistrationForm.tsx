'use client';

import { useEffect, useState } from 'react';
import { ProgramType } from '@/types';

const initial = { program_type: 'sunday_swim' as ProgramType, participant_name: '', participant_age: '', parent_name: '', email: '', phone: '', swimming_level: 'beginner', medical_notes: '', preferred_session: '', consent: false, payment_method: 'pay_on_site' };

export function RegistrationForm() {
  const [form, setForm] = useState(initial);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle'|'loading'|'success'|'error'; message?: string }>({ type: 'idle' });
  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then((data) => setStripeEnabled(Boolean(data.stripeEnabled))).catch(() => {});
    const selectProgram = (event: Event) => {
      const program = (event as CustomEvent<ProgramType>).detail;
      setForm((current) => ({ ...current, program_type: program }));
      fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_name: 'registration_started', metadata: { program } }) }).catch(() => {});
    };
    window.addEventListener('select-program', selectProgram);
    return () => window.removeEventListener('select-program', selectProgram);
  }, []);
  const update = (name: string, value: string|boolean) => setForm((current) => ({ ...current, [name]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setStatus({ type: 'loading' });
    try {
      const response = await fetch('/api/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Registration failed.');
      if (result.data.checkoutUrl) { window.location.assign(result.data.checkoutUrl); return; }
      setStatus({ type: 'success', message: result.data.checkoutError || result.message || `Registration saved. Reference: ${result.data.id}` });
      setForm(initial);
    } catch (error) { setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Registration failed.' }); }
  };
  const field = 'w-full px-3.5 py-2.5 bg-foam border border-line rounded-sm text-deep focus:outline-none focus:border-aqua';
  const label = 'font-display font-bold uppercase tracking-wider text-xs text-deep block mb-1';
  return <section id="register" className="sec bg-deep py-20 md:py-28 text-white"><div className="wrap grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
    <div><p className="eyebrow text-aqua">Registration</p><h2 className="font-extrabold uppercase text-3xl md:text-5xl mt-2">Reserve a swim spot</h2><p className="text-foam/80 mt-5">Choose a program, tell us what your swimmer needs, and select a payment option. We only mark online payments paid after Stripe confirms them.</p></div>
    <form onSubmit={submit} className="bg-white text-ink p-6 md:p-8 card-cut grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2"><label className={label}>Program *</label><select className={field} value={form.program_type} onChange={(e) => update('program_type', e.target.value)}><option value="sunday_swim">Sunday Swim Club</option><option value="summer_camp">Summer Swim Intensive</option><option value="private_coaching">Private Coaching</option></select></div>
      <div><label className={label}>Swimmer name *</label><input required className={field} value={form.participant_name} onChange={(e) => update('participant_name', e.target.value)} /></div>
      <div><label className={label}>Age</label><input type="number" min="2" max="100" className={field} value={form.participant_age} onChange={(e) => update('participant_age', e.target.value)} /></div>
      <div><label className={label}>Parent / guardian</label><input className={field} value={form.parent_name} onChange={(e) => update('parent_name', e.target.value)} /></div>
      <div><label className={label}>Swimming level *</label><select className={field} value={form.swimming_level} onChange={(e) => update('swimming_level', e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
      <div><label className={label}>Email *</label><input required type="email" className={field} value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
      <div><label className={label}>Phone / WhatsApp *</label><input required className={field} value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
      <div className="sm:col-span-2"><label className={label}>Preferred date / session</label><input className={field} placeholder="e.g. Next Sunday morning" value={form.preferred_session} onChange={(e) => update('preferred_session', e.target.value)} /></div>
      <div className="sm:col-span-2"><label className={label}>Medical or safety notes</label><textarea className={field} rows={3} value={form.medical_notes} onChange={(e) => update('medical_notes', e.target.value)} placeholder="Only information our coaches need to keep the swimmer safe" /></div>
      <div className="sm:col-span-2"><label className={label}>Payment method *</label><select className={field} value={form.payment_method} onChange={(e) => update('payment_method', e.target.value)}>{stripeEnabled && <option value="stripe">Pay online with Stripe</option>}<option value="bank_transfer">Bank transfer / manual verification</option><option value="pay_on_site">Pay on site</option></select></div>
      <label className="sm:col-span-2 flex gap-3 text-sm"><input required type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} /><span>I confirm these details are accurate and acknowledge that participation is subject to coach confirmation and safety requirements.</span></label>
      <button disabled={status.type === 'loading'} className="btn btn-sun sm:col-span-2 justify-center">{status.type === 'loading' ? 'Saving…' : form.payment_method === 'stripe' ? 'Register & Pay Securely' : 'Submit Registration'}</button>
      {status.message && <p role="status" className={`sm:col-span-2 p-3 text-sm ${status.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{status.message}</p>}
    </form>
  </div></section>;
}
