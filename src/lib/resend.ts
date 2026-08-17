import { Resend } from 'resend';
import { InquirySubmission } from '@/types';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_ADMIN_EMAIL = 'triplefinsswimpro@pointglobalmarketing.com';
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Triple Fins <onboarding@resend.dev>';

export async function sendInquiryEmails(inquiry: InquirySubmission) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not set. Email dispatch simulated.');
    return { success: true, simulated: true };
  }

  const adminEmail = process.env.CONTACT_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL;

  try {
    // 1. Email to Triple Fins Coaching & Admin Team
    const adminEmailPromise = resend.emails.send({
      from: SENDER_EMAIL,
      to: adminEmail,
      subject: `[New Inquiry] ${inquiry.name} - Triple Fins Swim Program`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0B2E4E; color: #ffffff; padding: 24px; border-radius: 8px;">
          <h2 style="color: #15D2DB; margin-top: 0;">New Program Enquiry Received</h2>
          <hr style="border: 0; border-top: 1px solid rgba(21, 210, 219, 0.3); margin: 16px 0;" />
          <p><strong>Name:</strong> ${inquiry.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${inquiry.email}" style="color: #FFB020;">${inquiry.email}</a></p>
          <p><strong>Phone:</strong> ${inquiry.phone || 'Not provided'}</p>
          <p><strong>Program Interest:</strong> ${inquiry.program_interest || 'General'}</p>
          <div style="background: rgba(255,255,255,0.08); padding: 14px; border-left: 4px solid #15D2DB; border-radius: 4px; margin-top: 14px;">
            <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #EAF4F6;">${inquiry.message}</p>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #9FBFC9;">Triple Fins Swim Program — Russell's Paradise, Yallahs, St. Thomas</p>
        </div>
      `,
    });

    // 2. Automated Confirmation Email to Customer
    const userEmailPromise = resend.emails.send({
      from: SENDER_EMAIL,
      to: inquiry.email,
      subject: 'Thank you for reaching out to Triple Fins Swim Program!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #D8E6EB; border-radius: 8px; overflow: hidden;">
          <div style="background: #0B2E4E; padding: 24px; text-align: center;">
            <h1 style="color: #15D2DB; font-size: 24px; margin: 0; text-transform: uppercase;">Triple Fins Swim Program</h1>
            <p style="color: #FFB020; margin: 6px 0 0 0; font-weight: bold;">Swim Strong. Play Hard. Build Champions.</p>
          </div>
          <div style="padding: 24px; color: #06202F; line-height: 1.6;">
            <p>Hi <strong>${inquiry.name}</strong>,</p>
            <p>Thank you for contacting Triple Fins! We have received your inquiry regarding our swim programs and merchandise.</p>
            <div style="background: #EAF4F6; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold; color: #0B2E4E;">Your message summary:</p>
              <p style="margin: 8px 0 0; font-style: italic; color: #5D7688;">"${inquiry.message}"</p>
            </div>
            <p>Our coaching and administrative team will review your message and get back to you shortly.</p>
            <p>In the meantime, feel free to give us a call or visit us during our Sunday sessions:</p>
            <ul style="color: #0B2E4E; padding-left: 20px;">
              <li><strong>Location:</strong> Russell's Paradise, Yallahs Main St, St. Thomas</li>
              <li><strong>Phone:</strong> +1 (876) 801-7907</li>
              <li><strong>Instagram:</strong> <a href="https://instagram.com/triplefins_swim" style="color: #0F8BBF;">@triplefins_swim</a></li>
            </ul>
            <p style="margin-top: 24px;">Best regards,<br><strong>The Triple Fins Team</strong></p>
          </div>
        </div>
      `,
    });

    await Promise.all([adminEmailPromise, userEmailPromise]);
    return { success: true };
  } catch (error) {
    console.error('[Resend Error]', error);
    return { success: false, error: (error as Error).message };
  }
}
