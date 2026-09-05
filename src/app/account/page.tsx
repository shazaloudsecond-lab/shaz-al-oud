"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { useCountry } from "@/context/CountryContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountModal from "@/components/AccountModal";

interface UserProfile {
  email: string;
  id: string;
  created_at?: string;
  full_name?: string;
  role?: string;
}

interface OrderItem {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  image_url?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  delivery_slot?: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function AccountPage() {
  const router = useRouter();
  const { t, tDynamic, isRTL, language } = useLanguage();
  const { formatPrice } = useCountry();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(true);

  const fetchUserData = async (currentUser: any) => {
    try {
      const supabase = createClient();
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .or(`user_id.eq.${currentUser.id},customer_email.eq.${currentUser.email}`)
        .order("created_at", { ascending: false });

      setUser({
        id: currentUser.id,
        email: currentUser.email || "",
        created_at: currentUser.created_at,
        full_name: profileData?.full_name || currentUser.user_metadata?.full_name || "",
        role: profileData?.role || (currentUser.email?.startsWith("admin@") ? "admin" : "user"),
      });

      setOrders(ordersData || []);
    } catch (err) {
      console.error("Error loading account data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const currentSession = sessionData?.session;

        if (currentSession?.user) {
          if (isMounted) {
            await fetchUserData(currentSession.user);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
    setIsAccountModalOpen(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return t("account.status_completed", "Completed");
      case "processing":
        return t("account.status_processing", "Processing");
      case "cancelled":
        return t("account.status_cancelled", "Cancelled");
      case "pending":
      default:
        return t("account.status_pending", "Pending");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white font-sans pb-24">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 space-y-8 animate-pulse">
          <div className="h-8 w-48 bg-neutral-900" />
          <div className="h-44 bg-neutral-950 border border-neutral-900" />
          <div className="h-64 bg-neutral-950 border border-neutral-900" />
        </div>
      </main>
    );
  }

  // If user is not logged in, open the existing AccountModal
  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white font-sans">
        <Navbar />
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => {
            setIsAccountModalOpen(false);
            router.push("/");
          }}
        />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 space-y-10 relative z-10">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold uppercase tracking-wider text-white font-primary">
              {t("account.title", "My Account")}
            </h1>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all font-mono rounded-sm"
                >
                  {t("account.admin_panel", "Admin Panel")}
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer font-mono rounded-sm"
              >
                {t("account.logout", "Sign Out")}
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-400">
            {t("account.subtitle", "Manage your personal information and track your orders")}
          </p>
        </div>

        {/* Profile Information Card */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center text-[#f0d5c8] flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg text-white truncate font-medium">
                {user.full_name || t("account.valued_customer", "Valued Customer")}
              </h2>
              <p className="text-xs text-neutral-400 truncate font-mono">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-neutral-900/60 p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                {t("account.email", "Email")}
              </p>
              <p className="text-xs sm:text-sm font-medium text-neutral-100 mt-1 truncate font-mono">{user.email}</p>
            </div>

            <div className="bg-neutral-900/60 p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                {t("account.account_type", "Account Type")}
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#f0d5c8] uppercase mt-1">
                {user.role === "admin"
                  ? t("account.administrator", "Administrator")
                  : t("account.member", "Member")}
              </p>
            </div>

            <div className="bg-neutral-900/60 p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                {t("account.member_since", "Member Since")}
              </p>
              <p className="text-xs sm:text-sm font-medium text-neutral-100 mt-1 font-mono">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                  : t("account.active", "Active")}
              </p>
            </div>
          </div>
        </div>

        {/* Order History Card */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-white font-primary">
              {t("account.order_history", "Order History")}
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              {orders.length} {orders.length === 1 ? t("account.order", "Order") : t("account.orders", "Orders")}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-neutral-900/30 p-6">
              <div className="w-12 h-12 bg-neutral-900 flex items-center justify-center mx-auto text-neutral-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-200">
                {t("account.no_orders_title", "No orders found")}
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {t("account.no_orders_desc", "You haven't placed any orders yet. Explore our fragrance collection to find your signature scent.")}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white hover:bg-[#f0d5c8] text-black text-xs font-semibold uppercase tracking-widest transition-colors mt-2 font-mono"
              >
                {t("account.explore_fragrances", "Explore Fragrances")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-neutral-900/70 border border-neutral-800 p-5 space-y-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                        {t("account.order_num", "Order #")}{order.order_number}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                        {new Date(order.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 ${
                          order.status === "completed"
                            ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                            : order.status === "processing"
                            ? "bg-blue-950/60 border border-blue-800 text-blue-300"
                            : order.status === "cancelled"
                            ? "bg-red-950/60 border border-red-800 text-red-300"
                            : "bg-amber-950/60 border border-amber-800 text-amber-300"
                        }`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      <p className="text-sm font-semibold text-[#dfc3b4] font-mono">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-neutral-300">
                          <span className="truncate pr-4">
                            {item.quantity}x {tDynamic(item.name || "Fragrance")}
                          </span>
                          <span className="font-mono text-neutral-400 flex-shrink-0">
                            {formatPrice(item.price || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
