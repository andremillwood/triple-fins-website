import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ success: false, error: 'Store is unavailable.' }, { status: 503 });
  const { data, error } = await supabase.from('products').select('id,slug,name,category,tier,price_jmd,image_url,image_urls,description,price_is_provisional,sizes').eq('is_active', true).order('sort_order');
  if (error) return NextResponse.json({ success: false, error: 'Could not load products.' }, { status: 500 });
  return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'no-store' } });
}
