import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const supabase = createAdminClient();

    // Query password_resets
    const { data, error } = await supabase
      .from("password_resets")
      .select("*")
      .eq("email", cleanEmail)
      .eq("otp", cleanOtp)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code. Please try again." },
        { status: 400 }
      );
    }

    const record = data[0];

    // Mark as verified
    await supabase
      .from("password_resets")
      .update({ is_verified: true })
      .eq("id", record.id);

    return NextResponse.json({
      success: true,
      resetId: record.id,
      message: "OTP verified successfully.",
    });
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
