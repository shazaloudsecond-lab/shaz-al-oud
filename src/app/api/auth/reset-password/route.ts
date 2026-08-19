import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword, resetId } = await req.json();

    if (!email || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Valid email and a password of at least 6 characters are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    // Verify resetId or OTP record
    let isValid = false;

    if (resetId) {
      const { data } = await supabase
        .from("password_resets")
        .select("*")
        .eq("id", resetId)
        .eq("email", cleanEmail)
        .eq("is_verified", true)
        .gt("expires_at", new Date().toISOString())
        .limit(1);

      if (data && data.length > 0) {
        isValid = true;
      }
    } else if (otp) {
      const { data } = await supabase
        .from("password_resets")
        .select("*")
        .eq("email", cleanEmail)
        .eq("otp", otp.trim())
        .gt("expires_at", new Date().toISOString())
        .limit(1);

      if (data && data.length > 0) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired reset session. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Update user password in Supabase
    if (supabase.auth.admin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Find user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      const targetUser = userData?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );

      if (!targetUser || userError) {
        return NextResponse.json(
          { error: "Account not found with this email." },
          { status: 404 }
        );
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      );

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    } else {
      // Direct client fallback
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // Delete or mark used
    if (resetId) {
      await supabase.from("password_resets").delete().eq("id", resetId);
    }

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset. You can now sign in.",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
