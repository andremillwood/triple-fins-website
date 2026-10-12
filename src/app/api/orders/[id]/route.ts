import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
  if (!rateLimit(request, 30)) return NextResponse.json({ error: 'Please wait before refreshing.' }, { status: 429, headers });
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!/^[a-f0-9]{64}$/.test(token) || !/^[a-f0-9-]{36}$/i.test(params.id)) return NextResponse.json({ error: 'Receipt not found.' }, { status: 404, headers });
  const db = getServiceSupabase();
  if (!db) return NextResponse.json({ error: 'Receipt service unavailable.' }, { status: 503, headers });
  const { data, error } = await db.from('orders').select('id,subtotal_jmd,payment_method,payment_status,fulfillment_method,fulfillment_status,created_at,order_items(product_name,quantity,unit_price_jmd,size)').eq('id', params.id).eq('receipt_token', token).single();
  if (error || !data) return NextResponse.json({ error: 'Receipt not found.' }, { status: 404, headers });
  return NextResponse.json({ data }, { headers });
}
