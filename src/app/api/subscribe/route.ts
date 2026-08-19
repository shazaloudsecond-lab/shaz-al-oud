import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if email already exists or insert directly
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email }]);

    if (error) {
      // Check for unique violation (code 23505)
      if (error.code === "23505" || error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique")) {
        return NextResponse.json(
          { error: "This email address is already subscribed!" },
          { status: 409 }
        );
      }
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to process subscription. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Thank you for subscribing to our newsletter!" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Subscribe route error:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
