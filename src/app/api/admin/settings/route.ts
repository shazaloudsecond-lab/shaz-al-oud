import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET — fetch all settings as { key: value } object
export async function GET() {
  try {
    const supabase = getServiceClient();
    
    // First try company_details table
    const { data: compData } = await supabase
      .from("company_details")
      .select("*")
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("admin_settings")
      .select("key, value");

    const settings: Record<string, string> = {};
    (data || []).forEach(({ key, value }: { key: string; value: string }) => {
      settings[key] = value;
    });

    if (compData) {
      if (compData.company_name) settings.company_name = compData.company_name;
      if (compData.address) settings.company_address = compData.address;
      if (compData.phone) settings.company_phone = compData.phone;
      if (compData.email) settings.company_email = compData.email;
      if (compData.tagline) settings.company_tagline = compData.tagline;
    }

    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — upsert settings { key, value } or { settings: { key: value } }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServiceClient();

    if (body.settings && typeof body.settings === "object") {
      const s = body.settings;
      
      // Also try to upsert into company_details if table exists
      try {
        const { data: existing } = await supabase.from("company_details").select("id").limit(1).maybeSingle();
        const payload = {
          company_name: s.company_name || null,
          address: s.company_address || null,
          phone: s.company_phone || null,
          email: s.company_email || null,
          tagline: s.company_tagline || null,
          updated_at: new Date().toISOString(),
        };
        if (existing?.id) {
          await supabase.from("company_details").update(payload).eq("id", existing.id);
        } else {
          await supabase.from("company_details").insert([payload]);
        }
      } catch (e) {
        // company_details table might not exist yet, fallback to admin_settings
      }

      const rows = Object.entries(body.settings).map(([key, value]) => ({
        key,
        value: typeof value === "string" ? value : String(value ?? ""),
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase
        .from("admin_settings")
        .upsert(rows, { onConflict: "key" });

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ error: "Key is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
