import { Resend } from 'resend';
import { User } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewCreativeNotification(clientUsers: User[], clientName: string, creativeCount: number) {
  const userEmails = clientUsers.map((user) => user.email);
  
  if (userEmails.length === 0) return null;
  
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'no-reply@leadgeneration.io',
      to: userEmails,
      subject: `New ad creatives for ${clientName} ready for review`,
      html: `
        <div>
          <h1>New Ad Creatives Uploaded</h1>
          <p>Hello,</p>
          <p>${creativeCount} new ad creative${creativeCount === 1 ? '' : 's'} have been uploaded for ${clientName} and are ready for your review.</p>
          <p>Please log in to the platform to review and approve or reject these new creatives.</p>
          <a href="${process.env.NEXTAUTH_URL}/review" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
            Review Creatives Now
          </a>
          <p style="margin-top: 24px;">Thank you,<br>The leadgeneration.io Team</p>
        </div>
      `,
    });
    
    return data;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return null;
  }
} 