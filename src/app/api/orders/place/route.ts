import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCountriesFromDB, getDefaultCountry, resolveProductPricing, Country } from "@/lib/countries";
import { buildAdminWhatsAppUrl } from "@/lib/whatsapp";

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cartItems,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      postalCode,
      userId,
      sessionId,
      notes,
      deliverySlot,
      clientCountryCode,
    } = body;

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    if (!customerName?.trim()) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    if (!address?.trim() || !city?.trim()) {
      return NextResponse.json({ error: "Delivery address and city are required." }, { status: 400 });
    }

    const supabase = getServiceClient();

    // 1. Resolve Customer Country on Backend
    const countries = await getCountriesFromDB(supabase);
    const defaultCountry = getDefaultCountry(countries);

    const headerCountry =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      req.headers.get("geo-country") ||
      clientCountryCode;

    let targetCode = headerCountry ? headerCountry.toUpperCase().trim() : null;

    let resolvedCountry: Country | null = null;
    if (targetCode) {
      resolvedCountry =
        countries.find(
          (c) => c.code.toUpperCase().trim() === targetCode && c.is_active
        ) || null;
    }
    if (!resolvedCountry) {
      resolvedCountry = defaultCountry;
    }

    const countryCode = resolvedCountry?.code || "QA";
    const countryName = resolvedCountry?.name || "Qatar";
    const currencyCode = resolvedCountry?.currency_code || "QAR";
    const currencySymbol = resolvedCountry?.currency_symbol || "ر.ق";
    const countryWhatsapp = resolvedCountry?.whatsapp_number || "";

    // 2. Fetch Products from Database (Security: prevents client price manipulation)
    const productIds: string[] = cartItems
      .map((item: any) => item.product?.id || item.productId)
      .filter(Boolean);

    const { data: dbProducts, error: productsErr } = await supabase
      .from("products")
      .select("id, name, brand_name, our_signature, price, original_price, volume, variants, image_url")
      .in("id", productIds);

    if (productsErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: "Failed to verify products in database." }, { status: 500 });
    }

    // 3. Build verified order items with DB country prices
    const orderItems: any[] = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const prodId = cartItem.product?.id || cartItem.productId;
      const dbProduct = dbProducts.find((p) => p.id === prodId);
      if (!dbProduct) continue;

      const selectedVolume = cartItem.product?.volume || cartItem.volume || dbProduct.volume || "30ml";
      const pricing = resolveProductPricing(dbProduct, countryCode, selectedVolume);

      const qty = Math.max(1, parseInt(cartItem.quantity) || 1);
      const sellingPrice = pricing.price;
      const originalPrice = pricing.original_price;
      const lineTotal = sellingPrice * qty;
      totalAmount += lineTotal;

      orderItems.push({
        product_id: dbProduct.id,
        name: dbProduct.our_signature || dbProduct.name,
        brand_name: dbProduct.brand_name || null,
        volume: pricing.volume,
        quantity: qty,
        price: sellingPrice,
        original_price: originalPrice,
        line_total: lineTotal,
        image_url: dbProduct.image_url || null,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "No valid products found." }, { status: 400 });
    }

    // 4. Generate unique order number
    const orderNumber =
      "SAO-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 5).toUpperCase();

    const fullNotes = [
      deliverySlot ? `Delivery Slot: ${deliverySlot}` : null,
      notes?.trim() || null,
    ]
      .filter(Boolean)
      .join(" | ");

    // 5. Build order record
    const orderRecord: any = {
      order_number: orderNumber,
      customer_name: customerName.trim(),
      customer_email: customerEmail?.trim().toLowerCase() || null,
      customer_phone: customerPhone.trim(),
      delivery_address: address.trim(),
      delivery_city: city.trim(),
      delivery_state: state?.trim() || null,
      delivery_postal_code: postalCode?.trim() || null,
      delivery_slot: deliverySlot || null,
      payment_method: "cod",
      status: "pending",
      total_amount: totalAmount,
      items: orderItems,
      notes: fullNotes || null,
      session_id: sessionId || null,
      country_code: countryCode,
      country_name: countryName,
      currency_code: currencyCode,
      currency_symbol: currencySymbol,
      whatsapp_phone: countryWhatsapp,
    };

    if (userId) orderRecord.user_id = userId;

    // Insert order into DB
    let { data: insertedOrder, error: insertError } = await supabase
      .from("orders")
      .insert([orderRecord])
      .select()
      .single();

    if (insertError && (insertError.message?.includes("column") || (insertError as any).code === "PGRST204")) {
      // Retry without newly added columns in case migration SQL hasn't been executed in Supabase yet
      const fallbackRecord: any = {
        order_number: orderRecord.order_number,
        customer_name: orderRecord.customer_name,
        customer_email: orderRecord.customer_email,
        customer_phone: orderRecord.customer_phone,
        delivery_address: orderRecord.delivery_address,
        delivery_city: orderRecord.delivery_city,
        delivery_state: orderRecord.delivery_state,
        delivery_postal_code: orderRecord.delivery_postal_code,
        delivery_slot: orderRecord.delivery_slot,
        payment_method: orderRecord.payment_method,
        status: orderRecord.status,
        total_amount: orderRecord.total_amount,
        items: orderRecord.items,
        notes: [
          orderRecord.notes,
          `Country: ${countryName} (${countryCode}) | Currency: ${currencyCode} (${currencySymbol}) | WhatsApp: ${countryWhatsapp}`,
        ]
          .filter(Boolean)
          .join(" | "),
        session_id: orderRecord.session_id,
      };
      if (userId) fallbackRecord.user_id = userId;

      const fallbackRes = await supabase
        .from("orders")
        .insert([fallbackRecord])
        .select()
        .single();

      insertedOrder = fallbackRes.data;
      insertError = fallbackRes.error;
    }

    if (insertError || !insertedOrder) {
      console.error("Order insert error:", insertError);
      return NextResponse.json(
        { error: insertError?.message || "Failed to place order." },
        { status: 500 }
      );
    }

    // Clear cart_items from DB
    if (sessionId || userId) {
      try {
        let deleteQuery = supabase.from("cart_items").delete();
        if (userId) {
          deleteQuery = deleteQuery.or(`user_id.eq.${userId},session_id.eq.${sessionId || ""}`);
        } else if (sessionId) {
          deleteQuery = deleteQuery.eq("session_id", sessionId);
        }
        await deleteQuery;
      } catch {}
    }

    // 6. Build Country-Specific WhatsApp Notification URL
    const whatsappUrl = buildAdminWhatsAppUrl(countryWhatsapp, {
      orderNumber: insertedOrder.order_number,
      customerName: orderRecord.customer_name,
      customerPhone: orderRecord.customer_phone,
      customerEmail: orderRecord.customer_email,
      deliveryAddress: orderRecord.delivery_address,
      deliveryCity: orderRecord.delivery_city,
      deliveryState: orderRecord.delivery_state,
      deliveryPostalCode: orderRecord.delivery_postal_code,
      deliverySlot: deliverySlot || null,
      countryName,
      countryCode,
      currencyCode,
      currencySymbol,
      paymentMethod: "Cash on Delivery (COD)",
      items: orderItems,
      subtotal: totalAmount,
      totalAmount,
      notes: orderRecord.notes,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: insertedOrder.id,
        orderNumber: insertedOrder.order_number,
        totalAmount: insertedOrder.total_amount,
        status: insertedOrder.status,
        createdAt: insertedOrder.created_at,
        items: orderItems,
        customerName: orderRecord.customer_name,
        customerPhone: orderRecord.customer_phone,
        customerEmail: orderRecord.customer_email,
        deliveryAddress: orderRecord.delivery_address,
        deliveryCity: orderRecord.delivery_city,
        deliveryState: orderRecord.delivery_state,
        deliveryPostalCode: orderRecord.delivery_postal_code,
        notes: orderRecord.notes,
        deliverySlot: deliverySlot || null,
        countryName,
        countryCode,
        currencyCode,
        currencySymbol,
        paymentMethod: "Cash on Delivery",
      },
      adminWhatsappPhone: countryWhatsapp,
      whatsappUrl,
    });
  } catch (err: any) {
    console.error("Order placement error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error placing order." },
      { status: 500 }
    );
  }
}
