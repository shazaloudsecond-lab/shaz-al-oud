import { SupabaseClient } from "@supabase/supabase-js";

export interface Country {
  id: string;
  name: string;
  code: string; // QA, BH, AE, SA, KW, OM, etc.
  currency_name: string;
  currency_code: string; // QAR, BHD, AED, etc.
  currency_symbol: string; // ر.ق, د.ب, د.إ, etc.
  whatsapp_number: string;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Returns Qatar (QA) as the main country, or the default active country from DB list, or null if empty.
 */
export function getDefaultCountry(countries: Country[] = []): Country | null {
  if (!countries || countries.length === 0) return null;
  // 1. Qatar (QA) is the main default country
  const qatar = countries.find((c) => c.code.toUpperCase().trim() === "QA" && c.is_active);
  if (qatar) return qatar;
  // 2. Explicitly marked default country in DB
  const defaultCountry = countries.find((c) => c.is_default && c.is_active);
  if (defaultCountry) return defaultCountry;
  // 3. First active country in DB
  const firstActive = countries.find((c) => c.is_active);
  if (firstActive) return firstActive;
  return countries[0] || null;
}

/**
 * Fetch all countries from the `countries` table ONLY.
 */
export async function getCountriesFromDB(supabase: SupabaseClient): Promise<Country[]> {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error querying countries table:", error.message);
      return [];
    }

    if (data && Array.isArray(data)) {
      return data as Country[];
    }
  } catch (err) {
    console.error("Exception querying countries table:", err);
  }

  return [];
}

/**
 * Resolves selling and original price for a specific product, country, and volume variant.
 */
export function resolveProductPricing(
  product: {
    price: number;
    original_price?: number | null;
    volume?: string | null;
    variants?: any[];
  },
  countryCode?: string | null,
  selectedVolume?: string | null
): {
  price: number;
  original_price?: number | null;
  volume: string;
  is_in_stock: boolean;
  is_available: boolean;
} {
  const normCountry = countryCode ? countryCode.toUpperCase().trim() : null;
  const variants = Array.isArray(product.variants) ? product.variants : [];

  // 1. If product has variants
  if (variants.length > 0) {
    // If specific volume requested, find that variant
    let targetVariant = selectedVolume
      ? variants.find(
          (v: any) =>
            v.volume?.toLowerCase().trim() === selectedVolume?.toLowerCase().trim()
        )
      : null;

    // If no specific volume requested, find first variant that is available in this country
    if (!targetVariant && normCountry) {
      targetVariant =
        variants.find((v: any) => {
          const cp = v.prices?.[normCountry];
          return cp && cp.price != null && cp.price !== "" && Number(cp.price) > 0;
        }) || null;
    }

    if (!targetVariant) {
      targetVariant = variants[0];
    }

    const vol = targetVariant?.volume || selectedVolume || product.volume || "30ml";
    const inStock = targetVariant?.is_in_stock !== false;

    // Check if variant has per-country pricing map
    if (normCountry && targetVariant?.prices && typeof targetVariant.prices === "object") {
      const countryPriceData = targetVariant.prices[normCountry];
      if (countryPriceData && countryPriceData.price != null && countryPriceData.price !== "") {
        const sellingPrice = Number(countryPriceData.price);
        if (!isNaN(sellingPrice) && sellingPrice > 0) {
          const originalPrice =
            countryPriceData.original_price != null && countryPriceData.original_price !== ""
              ? Number(countryPriceData.original_price)
              : null;
          const countryInStock = countryPriceData.is_in_stock !== false;
          return {
            price: sellingPrice,
            original_price: originalPrice,
            volume: vol,
            is_in_stock: inStock && countryInStock,
            is_available: true,
          };
        }
      }

      // If prices map exists on variants, but this specific country has no price entered:
      return {
        price: 0,
        original_price: null,
        volume: vol,
        is_in_stock: false,
        is_available: false,
      };
    }

    // Fallback if no country specified or no country map on variant
    if (targetVariant?.price != null && targetVariant.price !== "" && Number(targetVariant.price) > 0) {
      return {
        price: Number(targetVariant.price),
        original_price:
          targetVariant.original_price != null && targetVariant.original_price !== ""
            ? Number(targetVariant.original_price)
            : null,
        volume: vol,
        is_in_stock: inStock,
        is_available: true,
      };
    }
  }

  // 2. Base product level fallback (only if base price > 0 and no country map required)
  const basePrice = Number(product.price || 0);
  return {
    price: basePrice,
    original_price: product.original_price != null ? Number(product.original_price) : null,
    volume: selectedVolume || product.volume || "30ml",
    is_in_stock: true,
    is_available: basePrice > 0,
  };
}
