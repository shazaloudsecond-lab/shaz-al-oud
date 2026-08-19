/**
 * Builds a country-specific WhatsApp wa.me URL for order notification.
 * Uses official WhatsApp link scheme directed to the country's dedicated WhatsApp number.
 */
export function buildAdminWhatsAppUrl(
  adminPhone: string,
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryState: string | null;
    deliveryPostalCode: string | null;
    deliverySlot?: string | null;
    countryName?: string | null;
    countryCode?: string | null;
    currencyCode?: string | null;
    currencySymbol?: string | null;
    paymentMethod?: string | null;
    items: Array<{
      name: string;
      brand_name?: string | null;
      volume?: string | null;
      quantity: number;
      price: number; // Selling price
      original_price?: number | null; // Original price
      line_total: number;
    }>;
    subtotal?: number | null;
    totalAmount: number;
    notes: string | null;
  }
): string {
  // Clean phone — strip non-numeric except leading +
  const cleanPhone = adminPhone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  const curr = order.currencyCode || order.currencySymbol || "QAR";
  const countryDisplay = order.countryName
    ? `${order.countryName}${order.countryCode ? ` (${order.countryCode})` : ""}`
    : "Qatar (QA)";

  const addressParts = [
    order.deliveryAddress,
    order.deliveryCity,
    order.deliveryState,
    order.deliveryPostalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const itemLines = order.items
    .map((i, idx) => {
      const details = [
        `  ${idx + 1}. *${i.name}*`,
        i.brand_name ? `     • Brand: ${i.brand_name}` : null,
        i.volume ? `     • Volume: ${i.volume}` : null,
        `     • Quantity: ${i.quantity}`,
        i.original_price != null && i.original_price > i.price
          ? `     • Original Price: ${Number(i.original_price).toFixed(0)} ${curr}`
          : null,
        `     • Selling Price: ${Number(i.price).toFixed(0)} ${curr}`,
        `     • Subtotal: ${Number(i.line_total).toFixed(0)} ${curr}`,
      ].filter(Boolean);
      return details.join("\n");
    })
    .join("\n\n");

  const subtotal =
    order.subtotal != null
      ? order.subtotal
      : order.items.reduce((acc, item) => acc + item.line_total, 0);

  const message = [
    "🛍️ *NEW ORDER — SHAZ AL OUD*",
    "━━━━━━━━━━━━━━━━━━━━",
    `📦 *Order ID:* ${order.orderNumber}`,
    `🌍 *Country:* ${countryDisplay}`,
    `💱 *Currency:* ${curr}`,
    "",
    "👤 *CUSTOMER DETAILS*",
    `  • *Name:* ${order.customerName}`,
    `  • *Phone:* ${order.customerPhone}`,
    order.customerEmail ? `  • *Email:* ${order.customerEmail}` : null,
    `  • *Delivery Address:* ${addressParts}`,
    order.deliverySlot ? `  • *Slot Time:* ${order.deliverySlot}` : null,
    "",
    "🛒 *ORDERED PRODUCTS*",
    itemLines,
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    `💵 *Subtotal:* ${subtotal.toFixed(0)} ${curr}`,
    `💰 *Total Amount:* ${order.totalAmount.toFixed(0)} ${curr}`,
    `💳 *Payment Method:* ${order.paymentMethod || "Cash on Delivery (COD)"}`,
    order.notes ? `\n📝 *Notes:* ${order.notes}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
