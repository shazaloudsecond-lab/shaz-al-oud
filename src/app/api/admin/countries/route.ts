import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCountriesFromDB, Country } from "@/lib/countries";

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET: List all countries from countries table
export async function GET() {
  try {
    const supabase = getServiceClient();
    const countries = await getCountriesFromDB(supabase);
    return NextResponse.json({ success: true, countries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch countries." }, { status: 500 });
  }
}

// POST: Add new country directly to countries table
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      code,
      currency_name,
      currency_code,
      currency_symbol,
      whatsapp_number,
      is_active,
      is_default,
      display_order,
    } = body;

    if (!name?.trim() || !code?.trim() || !currency_code?.trim() || !whatsapp_number?.trim()) {
      return NextResponse.json(
        { error: "Name, Country Code, Currency Code, and WhatsApp Number are required." },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const normCode = code.trim().toUpperCase();

    // If is_default is true, unset any existing default country
    if (is_default) {
      await supabase.from("countries").update({ is_default: false }).neq("id", "none");
    }

    const newRecord = {
      name: name.trim(),
      code: normCode,
      currency_name: currency_name?.trim() || name.trim() + " Currency",
      currency_code: currency_code.trim().toUpperCase(),
      currency_symbol: currency_symbol?.trim() || currency_code.trim().toUpperCase(),
      whatsapp_number: whatsapp_number.trim(),
      is_active: is_active !== false,
      is_default: !!is_default,
      display_order: parseInt(display_order) || 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("countries")
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, country: data });
  } catch (err: any) {
    console.error("Error creating country:", err);
    return NextResponse.json({ error: err.message || "Failed to create country." }, { status: 500 });
  }
}

// PUT: Update existing country directly in countries table
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      code,
      currency_name,
      currency_code,
      currency_symbol,
      whatsapp_number,
      is_active,
      is_default,
      display_order,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Country ID is required." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const normCode = code ? code.trim().toUpperCase() : undefined;

    // If making default, unset other defaults
    if (is_default) {
      await supabase.from("countries").update({ is_default: false }).neq("id", id);
    }

    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updateFields.name = name.trim();
    if (normCode !== undefined) updateFields.code = normCode;
    if (currency_name !== undefined) updateFields.currency_name = currency_name.trim();
    if (currency_code !== undefined) updateFields.currency_code = currency_code.trim().toUpperCase();
    if (currency_symbol !== undefined) updateFields.currency_symbol = currency_symbol.trim();
    if (whatsapp_number !== undefined) updateFields.whatsapp_number = whatsapp_number.trim();
    if (is_active !== undefined) updateFields.is_active = !!is_active;
    if (is_default !== undefined) updateFields.is_default = !!is_default;
    if (display_order !== undefined) updateFields.display_order = parseInt(display_order) || 0;

    const { data, error } = await supabase
      .from("countries")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, country: data });
  } catch (err: any) {
    console.error("Error updating country:", err);
    return NextResponse.json({ error: err.message || "Failed to update country." }, { status: 500 });
  }
}

// DELETE: Delete a country directly from countries table
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Country ID is required." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from("countries").delete().eq("id", id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting country:", err);
    return NextResponse.json({ error: err.message || "Failed to delete country." }, { status: 500 });
  }
}
