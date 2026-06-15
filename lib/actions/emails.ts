"use server"

import { resend } from "@/lib/resend";

export async function sendFacilityAuthorizedEmail({
  email,
  facilityName,
  ownerName
}: {
  email: string;
  facilityName: string;
  ownerName: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SportBaba <onboarding@resend.dev>',
      to: email,
      subject: `Welcome to SportBaba: ${facilityName} is Live!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22c55e;">Your Facility is Approved! 🎉</h1>
          <p>Hi ${ownerName},</p>
          <p>Great news! Your facility <strong>${facilityName}</strong> has been authorized by the Superadmin.</p>
          <p>You can now log in to your dashboard to manage bookings, members, and revenue.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #22c55e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
            Go to Dashboard
          </a>

          <p style="margin-top: 30px; font-size: 14px;">Happy Pitch Management!<br/>The SportBaba Team</p>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendNewSignupAlertEmail({
  facilityName,
  ownerName,
  ownerEmail,
  sportType
}: {
  facilityName: string;
  ownerName: string;
  ownerEmail: string;
  sportType: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SportBaba System <onboarding@resend.dev>',
      to: 'far00queapril17@gmail.com', // Superadmin email
      subject: `🚨 New Signup: ${facilityName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3b82f6;">New Facility Registration</h2>
          <p>A new facility has just signed up and is waiting for approval.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;">🏢 <strong>Facility:</strong> ${facilityName}</p>
            <p style="margin: 5px 0;">👤 <strong>Owner:</strong> ${ownerName}</p>
            <p style="margin: 5px 0;">📧 <strong>Owner Email:</strong> ${ownerEmail}</p>
            <p style="margin: 5px 0;">⚽ <strong>Type:</strong> ${sportType}</p>
          </div>

          <p>Please log in to the admin dashboard to review and approve this facility.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">
            Go to Admin Dashboard
          </a>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendPasswordResetEmail({
  email,
  ownerName,
  facilityName,
  temporaryPassword
}: {
  email: string;
  ownerName: string;
  facilityName: string;
  temporaryPassword: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SportBaba <onboarding@resend.dev>',
      to: email,
      subject: `Password Reset for ${facilityName} - SportBaba`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Password Reset Request</h1>
          <p>Hi ${ownerName},</p>
          <p>Your password for <strong>${facilityName}</strong> has been reset by the Superadmin.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 5px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Temporary Password:</p>
            <p style="margin: 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #1e40af; letter-spacing: 1px;">
              ${temporaryPassword}
            </p>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>⚠️ Important:</strong> Please change this password immediately after logging in for security purposes.
            </p>
          </div>

          <p style="margin-top: 25px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Login to Dashboard
            </a>
          </p>

          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            If you didn't request this password reset, please contact the Superadmin immediately.
          </p>
          
          <p style="margin-top: 20px; font-size: 12px;">Best regards,<br/>The SportBaba Team</p>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendNotificationEmail({
  to,
  recipientName,
  subject,
  message,
  type,
  bookingDetails,
  actionUrl
}: {
  to: string;
  recipientName: string;
  subject: string;
  message: string;
  type: string;
  bookingDetails?: {
    resourceName?: string;
    startTime?: string;
    endTime?: string;
    facility?: string;
  };
  actionUrl?: string;
}) {
  try {
    // Determine icon and color based on notification type
    const typeConfig: Record<string, any> = {
      booking_confirmed: { icon: '✅', color: '#22c55e' },
      booking_cancelled: { icon: '❌', color: '#ef4444' },
      booking_reminder: { icon: '⏰', color: '#f59e0b' },
      booking_updated: { icon: '📝', color: '#3b82f6' },
      system: { icon: '📢', color: '#8b5cf6' }
    };

    const config = typeConfig[type] || { icon: '📧', color: '#6b7280' };

    const bookingSection = bookingDetails ? `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color};">
        ${bookingDetails.resourceName ? `<p style="margin: 5px 0;"><strong>🏟️ Resource:</strong> ${bookingDetails.resourceName}</p>` : ''}
        ${bookingDetails.startTime ? `<p style="margin: 5px 0;"><strong>🕐 Start:</strong> ${bookingDetails.startTime}</p>` : ''}
        ${bookingDetails.endTime ? `<p style="margin: 5px 0;"><strong>🕑 End:</strong> ${bookingDetails.endTime}</p>` : ''}
        ${bookingDetails.facility ? `<p style="margin: 5px 0;"><strong>🏢 Facility:</strong> ${bookingDetails.facility}</p>` : ''}
      </div>
    ` : '';

    const actionButton = actionUrl ? `
      <a href="${actionUrl}" style="display: inline-block; background: ${config.color}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
        View Details
      </a>
    ` : '';

    const { data, error } = await resend.emails.send({
      from: 'SportBaba Notifications <notifications@resend.dev>',
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">${config.icon}</div>
            <h1 style="color: ${config.color}; margin: 10px 0;">${subject}</h1>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi ${recipientName},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 20px 0;">
            ${message}
          </p>

          ${bookingSection}

          ${actionButton}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              You're receiving this because you have notifications enabled for this type of event.
            </p>
            <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #3b82f6; text-decoration: none;">
                Manage notification preferences
              </a>
            </p>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Best regards,<br/>The SportBaba Team
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}
