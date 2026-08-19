"use client";

import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveProductPricing } from "@/lib/countries";
import { useAdminContext } from "@/context/AdminContext";

interface DashboardOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: any[];
  country_code?: string | null;
  country_name?: string | null;
  currency_code?: string | null;
  currency_symbol?: string | null;
}

interface DashboardProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  volume?: string | null;
  variants?: any[];
  is_in_stock?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "text-orange-500 font-bold",
  processing: "text-yellow-500 font-bold",
  completed: "text-emerald-600 font-bold",
  cancelled: "text-red-600 font-bold",
};

export default function AdminDashboardPage() {
  const { selectedCountryCode, selectedCountry } = useAdminContext();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient();

        const [ordersRes, productsRes] = await Promise.all([
          supabase
            .from("orders")
            .select("id, order_number, customer_name, total_amount, status, created_at, items, country_code, country_name, currency_code, currency_symbol")
            .order("created_at", { ascending: false }),
          supabase
            .from("products")
            .select("id, name, price, original_price, volume, variants, is_in_stock"),
        ]);

        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currencyLabel = selectedCountry?.currency_code || "QAR";
  const currencySymbol = selectedCountry?.currency_symbol || "ر.ق";

  // Filter orders by selected country
  const filteredOrders = useMemo(() => {
    if (!selectedCountryCode) return orders;
    return orders.filter((o) => {
      if (o.country_code) {
        return o.country_code.toUpperCase().trim() === selectedCountryCode.toUpperCase().trim();
      }
      return selectedCountryCode.toUpperCase().trim() === "QA";
    });
  }, [orders, selectedCountryCode]);

  // Product count available in selected country
  const availableProductCount = useMemo(() => {
    if (!selectedCountryCode) return products.length;
    return products.filter((p) => {
      const pricing = resolveProductPricing(p, selectedCountryCode);
      return pricing.is_available;
    }).length;
  }, [products, selectedCountryCode]);

  // Total Revenue for selected country
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  }, [filteredOrders]);

  const completedCount = filteredOrders.filter((o) => o.status === "completed").length;
  const pendingCount = filteredOrders.filter((o) => o.status === "pending").length;
  const validOrdersCount = filteredOrders.filter((o) => o.status !== "cancelled").length;
  const avgOrderValue = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;

  const stats = [
    {
      title: `Total Revenue (${currencyLabel})`,
      value: loading ? "—" : `${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel}`,
      change: loading ? "" : `${completedCount} completed`,
      cardClass: "admin-stat-card-emerald",
      bgColor: "#dcfce7",
      borderColor: "#86efac",
      titleColor: "#166534",
      valueColor: "#15803d",
      changeColor: "#166534",
    },
    {
      title: "Total Orders",
      value: loading ? "—" : filteredOrders.length.toString(),
      change: loading ? "" : `${pendingCount} pending`,
      cardClass: "admin-stat-card-blue",
      bgColor: "#dbeafe",
      borderColor: "#93c5fd",
      titleColor: "#1e40af",
      valueColor: "#1d4ed8",
      changeColor: "#1e40af",
    },
    {
      title: "Products Available",
      value: loading ? "—" : availableProductCount.toString(),
      change: loading ? "" : `${products.length} total in catalog`,
      cardClass: "admin-stat-card-purple",
      bgColor: "#f3e8ff",
      borderColor: "#d8b4fe",
      titleColor: "#6b21a8",
      valueColor: "#7e22ce",
      changeColor: "#6b21a8",
    },
    {
      title: `Avg. Order Value (${currencyLabel})`,
      value: loading ? "—" : `${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel}`,
      change: loading ? "" : "excl. cancelled",
      cardClass: "admin-stat-card-amber",
      bgColor: "#fef3c7",
      borderColor: "#fde047",
      titleColor: "#854d0e",
      valueColor: "#a16207",
      changeColor: "#854d0e",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-white tracking-wide">Overview &amp; Metrics</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            Showing metrics for{" "}
            <span className="text-amber-400 font-semibold">
              {selectedCountry?.name || "Qatar"} ({currencyLabel} - {currencySymbol})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm font-mono"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-white font-bold">Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            style={{ backgroundColor: stat.bgColor, borderColor: stat.borderColor }}
            className={`admin-stat-card ${stat.cardClass} p-5 border transition-colors shadow-sm`}
          >
            <p style={{ color: stat.titleColor }} className="text-xs uppercase tracking-wider font-bold">
              {stat.title}
            </p>
            <p style={{ color: stat.valueColor }} className={`text-2xl font-extrabold mt-2 font-mono ${loading ? "animate-pulse" : ""}`}>
              {stat.value}
            </p>
            <span style={{ color: stat.changeColor }} className="text-xs mt-2 inline-block font-bold font-mono">
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
              Recent Orders ({selectedCountry?.name || "Qatar"})
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Latest transactions recorded for {selectedCountry?.name || "Qatar"}
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-500 animate-pulse">
            <p className="text-sm">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">
            <svg
              className="w-10 h-10 mx-auto text-neutral-700 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm">No orders recorded for {selectedCountry?.name || "Qatar"} yet.</p>
            <p className="text-xs text-neutral-600 mt-1">When customers in {selectedCountry?.name || "Qatar"} place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/60 text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3.5">Order #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Country</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredOrders.slice(0, 10).map((order) => {
                  const orderCurrency = order.currency_code || currencyLabel;

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-black">
                        <Link href={`/admin/orders`} className="hover:underline">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-black">{order.customer_name}</td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-black">
                        {order.country_code || selectedCountryCode}
                      </td>
                      <td className="px-6 py-4 text-neutral-600 text-xs font-mono">
                        {Array.isArray(order.items) ? order.items.length : 0} item
                        {Array.isArray(order.items) && order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 font-bold text-black font-mono">
                        {Number(order.total_amount).toFixed(2)} {orderCurrency}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-xs font-bold uppercase tracking-wider ${
                            statusColors[order.status] || "text-neutral-700 font-bold"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-600 font-mono">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
