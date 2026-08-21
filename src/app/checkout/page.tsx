"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buildAdminWhatsAppUrl } from "@/lib/whatsapp";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, loadingCart } = useCart();
  const { country, formatPrice, resolvePrice } = useCountry();
  const { t, tDynamic, isRTL } = useLanguage();

  const dynamicTotalPrice = cartItems.reduce((acc, item) => {
    const pr = resolvePrice(item.product, item.product.volume).price;
    return acc + pr * item.quantity;
  }, 0);

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [prefilled, setPrefilled] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliverySlot, setDeliverySlot] = useState<"morning" | "evening" | "custom">("morning");
  const [customTime, setCustomTime] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load session + prefill from profile if logged in
  useEffect(() => {
    const sess = localStorage.getItem("shaz_cart_session_id") || "";
    setSessionId(sess);

    const loadUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (user) {
          setUserId(user.id);

          if (!prefilled) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("full_name, phone")
              .eq("id", user.id)
              .maybeSingle();

            if (profile?.full_name) setFullName(profile.full_name);
            if (profile?.phone) setPhone(profile.phone);
            if (user.email) setEmail(user.email);
            setPrefilled(true);
          }
        }
      } catch {
        // Guest checkout: no user
      }
    };

    loadUser();
  }, [prefilled]);

  // Redirect to home if cart is empty (after loading)
  useEffect(() => {
    if (!loadingCart && cartItems.length === 0) {
      router.replace("/");
    }
  }, [loadingCart, cartItems, router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic client-side validation
    if (!fullName.trim()) return setErrorMsg(t("checkout.error_name", "Full name is required."));
    if (!phone.trim()) return setErrorMsg(t("checkout.error_phone", "Phone number is required."));
    if (!address.trim()) return setErrorMsg(t("checkout.error_address", "Delivery address is required."));
    if (!city.trim()) return setErrorMsg(t("checkout.error_city", "City is required."));
    if (deliverySlot === "custom" && !customTime.trim()) {
      return setErrorMsg(t("checkout.delivery_slot", "Please enter your preferred custom delivery time."));
    }
    if (cartItems.length === 0) return setErrorMsg(t("cart.empty_title", "Your cart is empty."));

    setSubmitting(true);

    const selectedSlotText =
      deliverySlot === "morning"
        ? "10:00 AM – 2:00 PM"
        : deliverySlot === "evening"
        ? "4:00 PM – 8:00 PM"
        : customTime.trim()
        ? `Custom (${customTime.trim()})`
        : "Custom Time";

    try {
      const res = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map((ci) => ({
            product: {
              id: ci.product.id,
              name: ci.product.name,
              brand_name: ci.product.brand_name || null,
              volume: ci.product.volume || null,
              price: ci.product.price,
            },
            quantity: ci.quantity,
          })),
          customerName: fullName.trim(),
          customerEmail: email.trim() || null,
          customerPhone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim() || null,
          postalCode: postalCode.trim() || null,
          deliverySlot: selectedSlotText,
          userId: userId || null,
          sessionId: sessionId || null,
          notes: notes.trim() || null,
          clientCountryCode: country?.code || "QA",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || t("checkout.error_general", "Failed to place order."));
      }

      // Clear local cart state
      clearCart();

      // Open WhatsApp with country-specific order notification
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      } else if (data.adminWhatsappPhone) {
        const waUrl = buildAdminWhatsAppUrl(data.adminWhatsappPhone, {
          orderNumber: data.order.orderNumber,
          customerName: data.order.customerName,
          customerPhone: data.order.customerPhone,
          customerEmail: data.order.customerEmail,
          deliveryAddress: data.order.deliveryAddress,
          deliveryCity: data.order.deliveryCity,
          deliveryState: data.order.deliveryState,
          deliveryPostalCode: data.order.deliveryPostalCode,
          deliverySlot: selectedSlotText,
          countryName: data.order.countryName || country?.name,
          countryCode: data.order.countryCode || country?.code,
          currencyCode: data.order.currencyCode || country?.currency_code,
          currencySymbol: data.order.currencySymbol || country?.currency_symbol,
          paymentMethod: data.order.paymentMethod || "Cash on Delivery",
          items: data.order.items,
          totalAmount: data.order.totalAmount,
          notes: data.order.notes,
        });
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }

      // Redirect to order confirmation page or home
      if (data.order?.orderNumber) {
        router.push(`/orders/${data.order.orderNumber}`);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || t("checkout.error_general", "Failed to place order. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 pt-32 pb-24 animate-pulse space-y-6">
          <div className="h-8 w-48 bg-neutral-900 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-neutral-950 border border-neutral-900 rounded-3xl" />
            <div className="h-64 bg-neutral-950 border border-neutral-900 rounded-3xl" />
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) return null;

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-32 sm:pb-24 relative z-10">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/" className="text-[13px] text-neutral-400 hover:text-white transition-colors flex items-center gap-2 w-fit mb-3 sm:mb-4">
            <svg className={`w-4 h-4 transform ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t("common.continue_shopping", "Back to Shopping")}</span>
          </Link>
          <h1 className="text-xl sm:text-3xl font-semibold uppercase tracking-wider text-white font-primary">
            {t("checkout.title", "Checkout")}
          </h1>
        </div>

        <form id="checkout-form" onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 sm:gap-8 items-start">
            {/* Left: Delivery Information */}
            <div className="space-y-5 sm:space-y-6">
              {/* Contact Info */}
              <div className=" p-0 space-y-4 sm:space-y-5">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white pb-2 sm:pb-4">
                  {t("checkout.contact_title", "Contact & Delivery Information")}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                      {t("checkout.full_name", "Full Name")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-[10px] sm:rounded-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                      {t("checkout.phone_number", "Phone Number")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-[10px] sm:rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                    {t("checkout.email", "Email Address")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-[10px] sm:rounded-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                    {t("checkout.address", "Delivery Address")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-[10px] sm:rounded-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                      {t("checkout.city", "City")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-[10px] sm:rounded-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                      {t("checkout.state", "Region / State")}
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-[10px] sm:rounded-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                      {t("checkout.postal_code", "Postal / Zone Code")}
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors rounded-[10px] sm:rounded-none"
                    />
                  </div>
                </div>

                {/* Delivery Time Slot */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("checkout.delivery_slot", "Preferred Delivery Time")}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliverySlot("morning")}
                      className={`py-3.5 px-3 text-center transition-all cursor-pointer text-xs font-mono rounded-[10px] sm:rounded-none ${
                        deliverySlot === "morning"
                          ? "bg-white text-black font-semibold shadow-lg"
                          : "bg-neutral-900 text-neutral-300 hover:text-white"
                      }`}
                    >
                      {t("checkout.slot_morning", "9:00 AM – 1:00 PM")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliverySlot("evening")}
                      className={`py-3.5 px-3 text-center transition-all cursor-pointer text-xs font-mono rounded-[10px] sm:rounded-none ${
                        deliverySlot === "evening"
                          ? "bg-white text-black font-semibold shadow-lg"
                          : "bg-neutral-900 text-neutral-300 hover:text-white"
                      }`}
                    >
                      {t("checkout.slot_evening", "6:00 PM – 10:00 PM")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliverySlot("custom")}
                      className={`py-3.5 px-3 text-center transition-all cursor-pointer text-xs rounded-[10px] sm:rounded-none ${
                        deliverySlot === "custom"
                          ? "bg-white text-black font-semibold shadow-lg"
                          : "bg-neutral-900 text-neutral-300 hover:text-white"
                      }`}
                    >
                      {t("checkout.slot_anytime", "Anytime (Standard Delivery)")}
                    </button>
                  </div>

                  {/* Custom Time Input */}
                  {deliverySlot === "custom" && (
                    <div className="pt-1.5">
                      <input
                        type="text"
                        required={deliverySlot === "custom"}
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors font-mono rounded-[10px] sm:rounded-none"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                    {t("checkout.order_notes", "Special Instructions / Delivery Notes")}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors resize-none rounded-[10px] sm:rounded-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-transparent">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white pb-2 sm:pb-4 mb-3 sm:mb-5">
                  {t("checkout.payment_title", "Payment Method")}
                </h2>

                <div className="flex items-center gap-4 p-4 bg-[#f0d5c8]/5 rounded-[10px] sm:rounded-none">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#f0d5c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{t("checkout.cod_name", "Cash on Delivery (COD)")}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{t("checkout.cod_desc", "Pay when your order arrives at your doorstep.")}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#f0d5c8] flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="space-y-4 lg:sticky lg:top-28">
              <div className="p-0 sm:p-6 bg-black/10 space-y-4 sm:space-y-5">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white pb-2 sm:pb-4">
                  {t("checkout.summary_title", "Order Summary")} ({cartItems.length} {cartItems.length === 1 ? t("common.item", "item") : t("common.items", "items")})
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-hide">
                  {cartItems.map(({ product, quantity }) => {
                    const itemPricing = resolvePrice(product, product.volume);

                    return (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] text-neutral-600">No img</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-100 truncate">{product.name}</p>
                          {product.volume && <p className="text-[10px] text-neutral-500 uppercase">{product.volume}</p>}
                          <p className="text-[11px] text-neutral-400 mt-0.5">{t("cart.quantity", "Qty")}: {quantity}</p>
                        </div>
                        <p className="text-xs font-semibold text-[#dfc3b4] font-mono flex-shrink-0">
                          {formatPrice(itemPricing.price * quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-2.5 border-t border-neutral-800 pt-4">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{t("checkout.delivery_title", "Delivering To")}</span>
                    <span className="text-amber-400 font-medium">
                      {country?.name} ({country?.currency_code})
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{t("cart.subtotal", "Subtotal")}</span>
                    <span className="font-mono text-neutral-200">{formatPrice(dynamicTotalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{t("badges.free_delivery_title", "Shipping")}</span>
                    <span className="text-emerald-400 font-medium">{t("common.best_seller", "Free")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>{t("checkout.payment_title", "Payment")}</span>
                    <span className="text-neutral-300">{t("checkout.cod_name", "Cash on Delivery (COD)")}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                    <span className="text-sm font-semibold text-white uppercase tracking-wide">{t("cart.order_total", "Total")}</span>
                    <span className="text-base font-bold text-white font-mono">{formatPrice(dynamicTotalPrice)}</span>
                  </div>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                  <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs">
                    {tDynamic(errorMsg)}
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full py-4 bg-white hover:bg-[#f0d5c8] disabled:opacity-60 text-black font-semibold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("checkout.processing_order", "Placing Order...")}
                    </>
                  ) : (
                    <>{t("checkout.place_order_btn", "Place Order")} • {formatPrice(dynamicTotalPrice)}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Fixed Bottom Confirm & Place Order Bar (Only on Checkout Page) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-md px-4 py-3 sm:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">{t("cart.order_total", "Total")}</p>
            <p className="text-sm font-bold text-white font-mono truncate">{formatPrice(dynamicTotalPrice)}</p>
          </div>
          <button
            form="checkout-form"
            type="submit"
            disabled={submitting || cartItems.length === 0}
            className="py-3.5 px-5 bg-white hover:bg-[#f0d5c8] disabled:opacity-60 text-black font-semibold text-xs uppercase tracking-widest text-center shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t("checkout.processing_order", "Placing...")}</span>
              </>
            ) : (
              <span>{t("checkout.place_order_btn", "Place Order")}</span>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
