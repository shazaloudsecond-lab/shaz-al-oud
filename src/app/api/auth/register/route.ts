import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if admin api is available for instant auto-confirmed creation
    if (supabase.auth.admin && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || "" },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Upsert profile
      if (data.user) {
        await supabase.from("user_profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName || "",
          role: "user",
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true, user: data.user });
    }

    // Fallback: standard signUp
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName || "" },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      await supabase.from("user_profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName || "",
        role: "user",
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, user: data.user, session: data.session });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
