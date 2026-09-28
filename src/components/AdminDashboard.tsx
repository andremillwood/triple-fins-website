'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Row = Record<string, string|number|null>;
export function AdminDashboard() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [signedIn, setSignedIn] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [registrations, setRegistrations] = useState<Row[]>([]);
  const [inquiries, setInquiries] = useState<Row[]>([]);
  const [message, setMessage] = useState('');
  const load = async () => {
    if (!supabase) return setMessage('Supabase is not configured.');
    const { data: role } = await supabase.from('staff_roles').select('role').maybeSingle();
    if (!role) { setAuthorized(false); return setMessage('This account is not authorized for staff access.'); }
    setAuthorized(true);
    const [registrationResult, inquiryResult] = await Promise.all([
      supabase.from('registrations').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    if (registrationResult.error || inquiryResult.error) setMessage('Could not load staff records.');
    setRegistrations(registrationResult.data || []); setInquiries(inquiryResult.data || []);
  };
  useEffect(() => { supabase?.auth.getSession().then(({ data }) => { const active = Boolean(data.session); setSignedIn(active); if (active) load(); }); }, []);
  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    if (!supabase) return setMessage('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) return setMessage('Sign-in failed. Check your email and password.');
    setSignedIn(true); await load();
  };
  const update = async (table: 'registrations'|'inquiries', id: string, field: string, value: string) => {
    if (!supabase) return;
    const { error } = await supabase.from(table).update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) setMessage('Update failed.'); else await load();
  };
  if (!signedIn) return <main className="min-h-screen bg-deep grid place-items-center p-5"><form onSubmit={login} className="bg-white p-8 w-full max-w-md card-cut"><p className="eyebrow">Staff only</p><h1 className="font-extrabold uppercase text-3xl text-deep mt-2 mb-6">Triple Fins Operations</h1><input required type="email" placeholder="Staff email" className="w-full border border-line p-3 mb-3" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} /><input required type="password" placeholder="Password" className="w-full border border-line p-3 mb-4" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} /><button className="btn btn-sun w-full justify-center">Sign in</button>{message && <p className="mt-4 text-sm text-rose-700">{message}</p>}</form></main>;
  if (!authorized) return <main className="p-10"><h1 className="text-3xl font-bold">Access denied</h1><p>{message}</p><button className="btn btn-deep mt-5" onClick={() => supabase?.auth.signOut().then(() => setSignedIn(false))}>Sign out</button></main>;
  const select = 'border border-line px-2 py-1 text-sm bg-white';
  return <main className="min-h-screen bg-foam p-4 md:p-8"><div className="max-w-7xl mx-auto"><div className="flex justify-between items-center mb-8"><div><p className="eyebrow">Secure staff area</p><h1 className="font-extrabold uppercase text-3xl md:text-5xl text-deep">Operations</h1></div><button className="btn btn-deep btn-sm" onClick={() => supabase?.auth.signOut().then(() => setSignedIn(false))}>Sign out</button></div>{message && <p className="p-3 bg-white mb-4">{message}</p>}
    <section className="bg-white p-4 mb-8 overflow-x-auto"><h2 className="font-bold uppercase text-2xl text-deep mb-4">Registrations</h2><table className="w-full text-sm"><thead><tr className="text-left"><th>Swimmer</th><th>Guardian / Contact</th><th>Program</th><th>Level</th><th>Created</th><th>Registration</th><th>Payment</th></tr></thead><tbody>{registrations.map((r) => <tr key={String(r.id)} className="border-t border-line"><td className="py-3 pr-4">{r.participant_name}<br />Age {r.participant_age || '—'}</td><td className="pr-4">{r.parent_name || '—'}<br />{r.email}<br />{r.phone}</td><td className="pr-4">{r.program_type}<br /><span className="text-muted">{r.preferred_session || ''}</span></td><td className="pr-4">{r.swimming_level}<br /><span className="text-muted">{r.medical_notes || ''}</span></td><td className="pr-4">{new Date(String(r.created_at)).toLocaleDateString()}</td><td><select className={select} value={String(r.registration_status)} onChange={(e) => update('registrations', String(r.id), 'registration_status', e.target.value)}><option>new</option><option>confirmed</option><option>attended</option><option>cancelled</option></select></td><td><select className={select} value={String(r.payment_status)} onChange={(e) => update('registrations', String(r.id), 'payment_status', e.target.value)}><option>pending</option><option>manual_verification</option><option>paid</option><option>waived</option><option>cancelled</option></select></td></tr>)}</tbody></table></section>
    <section className="bg-white p-4 overflow-x-auto"><h2 className="font-bold uppercase text-2xl text-deep mb-4">Inquiries</h2><table className="w-full text-sm"><thead><tr className="text-left"><th>Name / Contact</th><th>Interest</th><th>Message</th><th>Created</th><th>Status</th></tr></thead><tbody>{inquiries.map((r) => <tr key={String(r.id)} className="border-t border-line"><td className="py-3 pr-4">{r.name}<br />{r.email}<br />{r.phone || ''}</td><td className="pr-4">{r.program_interest}</td><td className="pr-4 max-w-sm">{r.message}</td><td className="pr-4">{new Date(String(r.created_at)).toLocaleDateString()}</td><td><select className={select} value={String(r.status)} onChange={(e) => update('inquiries', String(r.id), 'status', e.target.value)}><option>new</option><option>contacted</option><option>resolved</option><option>archived</option></select></td></tr>)}</tbody></table></section>
  </div></main>;
}
