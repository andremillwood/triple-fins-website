import { NextResponse } from 'next/server';
import { stripeEnabled } from '@/lib/stripe';

export function GET() {
  return NextResponse.json({ stripeEnabled });
}
