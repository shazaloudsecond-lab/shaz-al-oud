"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OrderItem {
  product_id: string;
  name: string;
  volume?: string | null;
  brand_name?: string | null;
  price: number;
  original_price?: number | null;
  quantity: number;
  line_total: number;
  image_url?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string | null;
  delivery_postal_code: string | null;
  delivery_slot?: string | null;
  payment_method: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  notes: string | null;
  created_at: string;
  country_name?: string | null;
  country_code?: string | null;
  currency_code?: string | null;
  currency_symbol?: string | null;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const { t, isRTL } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", orderNumber)
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
        } else {
          setOrder(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-32 pb-24 animate-pulse space-y-6">
          <div className="h-12 w-64 bg-neutral-900 rounded-2xl mx-auto" />
          <div className="h-64 bg-neutral-950 border border-neutral-900 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-32 pb-24 text-center">
          <h1 className="text-2xl font-semibold text-white">{t("order.not_found", "Order Not Found")}</h1>
          <p className="text-neutral-400 mt-2">{t("order.not_found_desc", "We couldn't find this order.")}</p>
          <Link href="/" className="inline-block mt-6 px-8 py-3 bg-white hover:bg-[#f0d5c8] text-black text-xs font-semibold uppercase tracking-widest rounded-xl">
            {t("order.back_home", "Return Home")}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "text-amber-300 border-amber-800 bg-amber-950/50",
    processing: "text-blue-300 border-blue-800 bg-blue-950/50",
    completed: "text-emerald-300 border-emerald-800 bg-emerald-950/50",
    cancelled: "text-red-300 border-red-800 bg-red-950/50",
  };

  const statusColor = statusColors[order.status] || "text-neutral-300 border-neutral-700 bg-neutral-900";
  const curr = order.currency_code || order.currency_symbol || "QAR";

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-24 space-y-8 relative z-10">
        {/* Success Header */}
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-600 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold uppercase tracking-wider text-white font-primary">
              {t("order.success_title", "Order Placed!")}
            </h1>
            <p className="text-neutral-400 text-sm mt-2">
              {t("order.thank_you", "Thank you")}, <span className="text-white font-medium">{order.customer_name}</span>! {t("order.confirmation_msg", "Your order has been recorded.")}
            </p>
          </div>
        </div>

        {/* Order Meta */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{t("order.order_number", "Order Number")}</p>
              <p className="text-sm font-bold font-mono text-white mt-1">{order.order_number}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{t("order.order_date", "Order Date")}</p>
              <p className="text-sm text-neutral-200 mt-1">
                {new Date(order.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{t("order.status", "Status")}</p>
              <span className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border mt-1 ${statusColor}`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{t("order.payment_method", "Payment")}</p>
              <p className="text-sm text-[#f0d5c8] font-medium mt-1">{t("checkout.cod_name", "Cash on Delivery")}</p>
            </div>
            {order.country_name && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{t("checkout.delivery_title", "Country")}</p>
                <p className="text-sm text-white font-medium mt-1">
                  {order.country_name} ({curr})
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {t("order.items_ordered", "Items Ordered")}
            </h2>
            {Array.isArray(order.items) && order.items.map((item, idx) => {
              return (
                <div key={idx} className="flex items-center gap-4 py-3 border-b border-neutral-800/60 last:border-0">
                  <div className="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[9px] text-neutral-600">No img</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {item.volume ? `${item.volume} • ` : ""}{t("cart.quantity", "Qty")}: {item.quantity} × {Number(item.price).toFixed(0)} {curr}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#dfc3b4] font-mono flex-shrink-0">
                    {Number(item.line_total).toFixed(0)} {curr}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-neutral-800 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400">{t("cart.subtotal", "Subtotal")}</span>
              <span className="text-sm font-mono text-neutral-200">
                {Number(order.total_amount).toFixed(0)} {curr}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400">{t("badges.free_delivery_title", "Shipping")}</span>
              <span className="text-xs text-emerald-400 font-medium">{t("common.best_seller", "Free")}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
              <span className="text-sm font-bold text-white uppercase tracking-wider">{t("cart.order_total", "Total")}</span>
              <span className="text-lg font-bold text-white font-mono">
                {Number(order.total_amount).toFixed(0)} {curr}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-5 pb-4 border-b border-neutral-800">
            {t("order.delivery_details", "Delivery Details")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{t("checkout.full_name", "Name")}</p>
              <p className="text-neutral-100">{order.customer_name}</p>
            </div>
            {order.customer_phone && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{t("checkout.phone_number", "Phone")}</p>
                <p className="text-neutral-100">{order.customer_phone}</p>
              </div>
            )}
            {order.customer_email && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{t("checkout.email", "Email")}</p>
                <p className="text-neutral-100">{order.customer_email}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{t("checkout.address", "Address")}</p>
              <p className="text-neutral-100">
                {order.delivery_address}, {order.delivery_city}
                {order.delivery_state ? `, ${order.delivery_state}` : ""}
                {order.delivery_postal_code ? ` - ${order.delivery_postal_code}` : ""}
              </p>
            </div>
            {order.delivery_slot && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{t("checkout.delivery_slot", "Preferred Time Slot")}</p>
                <p className="text-amber-300 font-mono font-medium">{order.delivery_slot}</p>
              </div>
            )}
            {order.notes && (
              <div className="sm:col-span-2">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{t("checkout.order_notes", "Notes")}</p>
                <p className="text-neutral-300 text-xs">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* COD Notice */}
        <div className="flex items-start gap-4 p-5 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">{t("checkout.cod_name", "Cash on Delivery")}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {t("checkout.cod_desc", "Please keep the amount ready at the time of delivery.")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3.5 text-center bg-white hover:bg-[#f0d5c8] text-black text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-lg"
          >
            {t("common.continue_shopping", "Continue Shopping")}
          </Link>
          <Link
            href="/account"
            className="flex-1 py-3.5 text-center bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all"
          >
            {t("nav.account", "View My Account")}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
