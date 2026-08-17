import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendInquiryEmails } from '@/lib/resend';
import { InquirySubmission } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, program_interest } = body as InquirySubmission;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes('@')) {
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
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      message: message.trim(),
      program_interest: program_interest || 'General Inquiry',
    };

    // 1. Insert into Supabase (if configured)
    const supabase = getServiceSupabase();
    let dbRecordId: string | null = null;

    if (supabase) {
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
      } else if (data) {
        dbRecordId = data.id;
      }
    } else {
      console.warn('[Supabase] Not configured. Skipping database write.');
    }

    // 2. Dispatch notification & confirmation via Resend
    const emailResult = await sendInquiryEmails(payload);

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your enquiry has been received and our team will get in touch shortly.',
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
