import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendInquiryEmails } from '@/lib/resend';
import { InquirySubmission } from '@/types';
import { clean, validEmail } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    if (!rateLimit(request)) return NextResponse.json({ success: false, error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    const body = await request.json();
    const { name, email, phone, message, program_interest } = body as InquirySubmission;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || !validEmail(clean(email, 254))) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    const payload: InquirySubmission = {
      name: clean(name, 120),
      email: clean(email, 254).toLowerCase(),
      phone: clean(phone, 40) || undefined,
      message: clean(message, 2000),
      program_interest: clean(program_interest, 80) || 'General Inquiry',
    };

    // 1. Insert into Supabase (if configured)
    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Registration service is not configured. Please call or WhatsApp us.' }, { status: 503 });
    }
    let dbRecordId: string | null = null;
    {
      const { data, error: dbError } = await supabase
        .from('inquiries')
        .insert([
          {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            message: payload.message,
            program_interest: payload.program_interest,
            status: 'new',
          },
        ])
        .select('id')
        .single();

      if (dbError) {
        console.error('[Supabase Insert Error]', dbError);
        return NextResponse.json({ success: false, error: 'We could not safely save your enquiry. Please try again or contact us by phone.' }, { status: 500 });
      } else if (data) {
        dbRecordId = data.id;
      }
    }

    // 2. Dispatch notification & confirmation via Resend
    const emailResult = await sendInquiryEmails(payload);

    return NextResponse.json(
      {
        success: true,
        message: emailResult.success
          ? 'Thank you! Your enquiry has been received and our team will get in touch shortly.'
          : 'Your enquiry was saved, but we could not send the confirmation email. Our team can still see it.',
        data: {
          id: dbRecordId,
          emailSent: emailResult.success,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[API /contact Error]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process inquiry. Please try again later.' },
      { status: 500 }
    );
  }
}
