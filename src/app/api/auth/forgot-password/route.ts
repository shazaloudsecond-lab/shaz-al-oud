import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store OTP in database
    const { error: dbError } = await supabase.from("password_resets").insert([
      {
        email: cleanEmail,
        otp,
        expires_at: expiresAt,
        is_verified: false,
      },
    ]);

    if (dbError) {
      console.error("Error storing OTP in DB:", dbError);
    }

    // HTML Email Template for Brevo
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0c0a09; color: #f5f5f4; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #292524;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 4px; text-transform: uppercase; margin: 0;">SHAZ AL OUD</h1>
          <p style="color: #a8a29e; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px;">Luxury Arabian Fragrances</p>
        </div>
        
        <div style="background-color: #1c1917; border-radius: 12px; padding: 30px; text-align: center; border: 1px solid #44403c;">
          <h2 style="color: #f5f5f4; font-size: 18px; font-weight: 500; margin-top: 0;">Password Reset Code</h2>
          <p style="color: #a8a29e; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset the password for your Shaz Al Oud account. Use the one-time code below to complete your reset:
          </p>
          
          <div style="background-color: #0c0a09; border: 2px dashed #f0d5c8; border-radius: 10px; padding: 18px; display: inline-block; min-width: 200px; margin: 10px 0 25px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #f0d5c8; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="color: #78716c; font-size: 12px; margin: 0;">
            This code will expire in <strong>10 minutes</strong>. If you did not request this password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #57534e;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Shaz Al Oud. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send email using Brevo
    await sendBrevoEmail({
      to: cleanEmail,
      subject: `Your Shaz Al Oud Password Reset Code: ${otp}`,
      htmlContent,
      textContent: `Your Shaz Al Oud password reset code is: ${otp}. It expires in 10 minutes.`,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
