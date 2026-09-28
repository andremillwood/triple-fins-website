import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

const allowed = new Set(['program_cta_clicked','registration_started','registration_completed','order_started','order_completed','inquiry_submitted']);
export async function POST(request: Request) {
  if (!rateLimit(request, 30)) return NextResponse.json({ success: false }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (!body || !allowed.has(body.event_name)) return NextResponse.json({ success: false }, { status: 400 });
  const supabase = getServiceSupabase();
  if (supabase) await supabase.from('analytics_events').insert({ event_name: body.event_name, metadata: typeof body.metadata === 'object' ? body.metadata : {} });
  return NextResponse.json({ success: true });
}
