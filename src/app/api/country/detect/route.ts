import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCountriesFromDB, getDefaultCountry, Country } from "@/lib/countries";

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Detect customer country from headers or IP geolocation, matched against DB countries only.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient();
    const countries = await getCountriesFromDB(supabase);
    const defaultCountry = getDefaultCountry(countries);

    // 1. Check CDN & Cloud provider headers
    const headerCountry =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      req.headers.get("geo-country");

    let detectedCode = headerCountry ? headerCountry.toUpperCase().trim() : null;
    let isDetected = false;

    // 2. If no header code or local development "XX" / "T1", attempt fast IP lookup
    if (!detectedCode || detectedCode === "XX" || detectedCode === "T1" || detectedCode === "LOCALHOST") {
      const forwarded = req.headers.get("x-forwarded-for");
      const realIp = req.headers.get("x-real-ip");
      const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp;

      // Only query external if clientIp is a public IP (not loopback/private)
      if (
        clientIp &&
        !clientIp.startsWith("127.") &&
        !clientIp.startsWith("192.168.") &&
        !clientIp.startsWith("10.") &&
        !clientIp.startsWith("::1") &&
        !clientIp.startsWith("172.")
      ) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1800);
          const geoRes = await fetch(`https://api.country.is/${clientIp}`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData?.country) {
              detectedCode = geoData.country.toUpperCase().trim();
              isDetected = true;
            }
          }
        } catch {
          // Ignore external lookup failure
        }
      }
    } else {
      isDetected = true;
    }

    // 3. Match detected country code with active DB countries
    let resolvedCountry: Country | null = null;
    if (detectedCode && countries.length > 0) {
      resolvedCountry =
        countries.find(
          (c) =>
            c.is_active &&
            (c.code.toUpperCase().trim() === detectedCode ||
              c.name.toUpperCase().trim() === detectedCode ||
              (detectedCode === "IN" && (c.code === "91" || c.name.toUpperCase().includes("INDIA"))) ||
              (detectedCode === "QA" && (c.code === "974" || c.name.toUpperCase().includes("QATAR"))) ||
              (detectedCode === "BH" && (c.code === "973" || c.name.toUpperCase().includes("BAHRAIN"))))
        ) || null;
    }

    // 4. Fallback to configured DB default country (Qatar)
    if (!resolvedCountry) {
      resolvedCountry = defaultCountry;
    }

    return NextResponse.json({
      success: true,
      isDetected,
      detectedCode: detectedCode || null,
      country: resolvedCountry,
      countries: countries.filter((c) => c.is_active),
    });
  } catch (err: any) {
    console.error("Country detection error:", err);
    return NextResponse.json(
      {
        success: false,
        isDetected: false,
        country: null,
        countries: [],
      },
      { status: 200 }
    );
  }
}
