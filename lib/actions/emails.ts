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
