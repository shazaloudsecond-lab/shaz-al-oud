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
  customer_email?: string | null;
  customer_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string | null;
  delivery_postal_code?: string | null;
  delivery_slot?: string | null;
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
  image_url?: string;
  price: number;
  original_price?: number | null;
  volume?: string | null;
  variants?: any[];
  is_in_stock?: boolean;
}

// Simple SVG Donut Chart
function DonutChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-36">
        <p className="text-xs" style={{ color: "var(--adm-text-muted)" }}>No order data</p>
      </div>
    );
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data.map((d) => {
    const pct = d.count / total;
    const dash = pct * circumference;
    const seg = { ...d, dash, offset, pct };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background ring */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--adm-border)" strokeWidth="12" />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold" style={{ color: "var(--adm-text)" }}>{total}</span>
          <span className="text-[9px] font-medium" style={{ color: "var(--adm-text-muted)" }}>Orders</span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span style={{ color: "var(--adm-text-muted)" }}>{d.label}</span>
            </div>
            <span className="font-semibold tabular-nums" style={{ color: "var(--adm-text)" }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline bar for Top Products
function InlineBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--adm-border)" }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { selectedCountryCode, selectedCountry } = useAdminContext();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Table search / filter
  const [tableSearch, setTableSearch] = useState("");
  const [tableStatus, setTableStatus] = useState("all");
  const [tableDateFilter, setTableDateFilter] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient();
        const [ordersRes, productsRes] = await Promise.all([
          supabase
            .from("orders")
            .select("id, order_number, customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_state, delivery_postal_code, delivery_slot, total_amount, status, created_at, items, country_code, country_name, currency_code, currency_symbol")
            .order("created_at", { ascending: false }),
          supabase
            .from("products")
            .select("id, name, image_url, price, original_price, volume, variants, is_in_stock"),
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

  // Filter orders by selected country
  const filteredOrders = useMemo(() => {
    if (!selectedCountryCode) return orders;
    return orders.filter((o) => {
      if (o.country_code) return o.country_code.toUpperCase().trim() === selectedCountryCode.toUpperCase().trim();
      return selectedCountryCode.toUpperCase().trim() === "QA";
    });
  }, [orders, selectedCountryCode]);

  // Product count
  const availableProductCount = useMemo(() => {
    if (!selectedCountryCode) return products.length;
    return products.filter((p) => {
      const pricing = resolveProductPricing(p, selectedCountryCode);
      return pricing.is_available;
    }).length;
  }, [products, selectedCountryCode]);

  // Stats
  const completedOrders = filteredOrders.filter((o) => o.status === "completed");
  const pendingOrders   = filteredOrders.filter((o) => o.status === "pending");
  const validOrders     = filteredOrders.filter((o) => o.status !== "cancelled");
  const totalRevenue    = validOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const avgOrderValue   = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Status breakdown for donut chart
  const statusGroups = [
    { label: "Pending",   count: filteredOrders.filter(o => o.status === "pending").length,    color: "#f97316" },
    { label: "Confirmed", count: filteredOrders.filter(o => o.status === "processing").length,  color: "#3b82f6" },
    { label: "Completed", count: filteredOrders.filter(o => o.status === "completed").length,  color: "#10b981" },
    { label: "Cancelled", count: filteredOrders.filter(o => o.status === "cancelled").length,  color: "#ef4444" },
  ].filter(s => s.count > 0);

  // Top Products by order count (from order items)
  const topProducts = useMemo(() => {
    const countMap: Record<string, { name: string; image_url: string; orders: number }> = {};
    filteredOrders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach((item: any) => {
        const name = item.name || "Unknown";
        if (!countMap[name]) countMap[name] = { name, image_url: item.image_url || "", orders: 0 };
        countMap[name].orders += 1;
      });
    });
    return Object.values(countMap).sort((a, b) => b.orders - a.orders).slice(0, 5);
  }, [filteredOrders]);

  const maxProductOrders = topProducts[0]?.orders || 1;

  // Recent Customers
  const recentCustomers = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string; orderCount: number }[] = [];
    const countMap: Record<string, number> = {};
    filteredOrders.forEach((o) => { countMap[o.customer_name] = (countMap[o.customer_name] || 0) + 1; });
    filteredOrders.forEach((o) => {
      if (!seen.has(o.customer_name)) {
        seen.add(o.customer_name);
        result.push({ name: o.customer_name, orderCount: countMap[o.customer_name] });
      }
    });
    return result.slice(0, 5);
  }, [filteredOrders]);

  // Table filter pipeline
  const tableOrders = useMemo(() => {
    let list = [...filteredOrders];

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q)
      );
    }

    if (tableStatus !== "all") {
      list = list.filter((o) => o.status === tableStatus);
    }

    if (tableDateFilter !== "all") {
      const now = new Date();
      const days = tableDateFilter === "7d" ? 7 : tableDateFilter === "30d" ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      list = list.filter((o) => new Date(o.created_at) >= cutoff);
    }

    return list.slice(0, 10);
  }, [filteredOrders, tableSearch, tableStatus, tableDateFilter]);

  // Stat cards config — WHITE card with colored icon box
  const stats = [
    {
      title: `Total Revenue`,
      value: loading ? "—" : `${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel}`,
      change: loading ? "" : `+${completedOrders.length} completed order${completedOrders.length !== 1 ? "s" : ""}`,
      changePositive: true,
      changeColor: "#16a34a",
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Total Orders",
      value: loading ? "—" : filteredOrders.length.toString(),
      change: loading ? "" : `${pendingOrders.length} pending · ${completedOrders.length} completed`,
      changePositive: false,
      changeColor: "#f97316",
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: "Products Available",
      value: loading ? "—" : availableProductCount.toString(),
      change: loading ? "" : `${products.length} total in catalog`,
      changePositive: false,
      changeColor: "#7c3aed",
      iconBg: "#f3e8ff",
      iconColor: "#7c3aed",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: `Avg. Order Value`,
      value: loading ? "—" : `${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel}`,
      change: "excl. cancelled",
      changePositive: false,
      changeColor: "#d97706",
      iconBg: "#fef3c7",
      iconColor: "#d97706",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { bg: string; text: string; dot: string }> = {
      pending:   { bg: "#fff7ed", text: "#c2410c", dot: "#f97316" },
      processing:{ bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
      completed: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
      cancelled: { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
    };
    const c = cfg[status] || { bg: "#f9fafb", text: "#374151", dot: "#9ca3af" };
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: c.bg, color: c.text, borderRadius: "4px" }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
        {status}
      </span>
    );
  };

  // Today's date
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* ===== Welcome Banner ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--adm-text)" }}>
            Welcome Back 👋
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--adm-text-muted)" }}>
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs" style={{ color: "var(--adm-text-muted)" }}>{today}</span>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            style={{ backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)", borderRadius: "4px" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* ===== Stat Cards — White card with colored icon box ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="p-5 border flex items-center gap-4 transition-shadow hover:shadow-md"
            style={{
              backgroundColor: "var(--adm-card-bg)",
              borderColor: "var(--adm-border)",
              borderRadius: "4px",
              boxShadow: "var(--adm-shadow)",
            }}
          >
            {/* Colored icon box */}
            <div
              className="w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: stat.iconBg, color: stat.iconColor, borderRadius: "4px" }}
            >
              {stat.icon}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: "var(--adm-text-muted)" }}>
                {stat.title}
              </p>
              <p
                className={`text-xl font-extrabold mt-0.5 font-mono leading-tight ${loading ? "animate-pulse" : ""}`}
                style={{ color: "var(--adm-text)" }}
              >
                {stat.value}
              </p>
              <span
                className="text-[10px] mt-1 inline-flex items-center gap-1 font-semibold"
                style={{ color: stat.changeColor }}
              >
                {stat.changePositive && stat.change && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {stat.change}
              </span>
            </div>

            {/* Right arrow */}
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--adm-hover-bg)", borderRadius: "50%", color: "var(--adm-text-sub)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Recent Orders Table ===== */}
      <div
        className="border overflow-hidden"
        style={{ backgroundColor: "var(--adm-card-bg)", borderColor: "var(--adm-border)", borderRadius: "4px" }}
      >
        {/* Table header */}
        <div
          className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ borderColor: "var(--adm-border)" }}
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>
              Recent Orders ({selectedCountry?.name || "Qatar"})
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-muted)" }}>
              Latest transactions recorded for your store.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 border text-xs"
              style={{ backgroundColor: "var(--adm-input-bg)", borderColor: "var(--adm-input-border)", color: "var(--adm-text-sub)", borderRadius: "4px", minWidth: "180px" }}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search orders..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full"
                style={{ color: "var(--adm-text)" }}
              />
            </div>

            {/* Status filter */}
            <select
              value={tableStatus}
              onChange={(e) => setTableStatus(e.target.value)}
              className="px-3 py-1.5 border text-xs cursor-pointer"
              style={{
                backgroundColor: "var(--adm-input-bg)",
                borderColor: "var(--adm-input-border)",
                color: "var(--adm-text)",
                borderRadius: "4px",
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date filter */}
            <select
              value={tableDateFilter}
              onChange={(e) => setTableDateFilter(e.target.value)}
              className="px-3 py-1.5 border text-xs cursor-pointer"
              style={{
                backgroundColor: "var(--adm-input-bg)",
                borderColor: "var(--adm-input-border)",
                color: "var(--adm-text)",
                borderRadius: "4px",
              }}
            >
              <option value="all">All Dates</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            {/* View All */}
            <Link
              href="/admin/orders"
              className="px-3 py-1.5 border text-xs font-semibold flex items-center gap-1.5 transition-all"
              style={{
                borderColor: "var(--adm-border-strong)",
                color: "var(--adm-text)",
                backgroundColor: "var(--adm-card-bg)",
                borderRadius: "4px",
              }}
            >
              View All
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center" style={{ color: "var(--adm-text-muted)" }}>
            <div className="animate-pulse space-y-3 px-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 rounded" style={{ backgroundColor: "var(--adm-hover-bg)" }} />
              ))}
            </div>
          </div>
        ) : tableOrders.length === 0 ? (
          <div className="py-14 text-center">
            <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" style={{ color: "var(--adm-border-strong)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm" style={{ color: "var(--adm-text-muted)" }}>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ backgroundColor: "var(--adm-thead-bg)", borderBottom: `1px solid var(--adm-border)` }}>
                <tr>
                  {["ORDER #", "CUSTOMER", "COUNTRY", "ITEMS", "AMOUNT", "STATUS", "DATE", "ACTIONS"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--adm-text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableOrders.map((order) => {
                  const orderCurrency = order.currency_code || currencyLabel;
                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        className="transition-colors hover:bg-[var(--adm-card-hover)]"
                        style={{ borderBottom: "1px solid var(--adm-border)" }}
                      >
                        <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: "var(--adm-text)" }}>
                          <Link href="/admin/orders" className="hover:underline">{order.order_number}</Link>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-sm" style={{ color: "var(--adm-text)" }}>
                          {order.customer_name}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const code = (order.country_code || selectedCountryCode || "QA").toLowerCase().slice(0, 2);
                              return (
                                <span className="flex-shrink-0 overflow-hidden inline-flex items-center" style={{ width: "24px", height: "18px", borderRadius: "2px" }}>
                                  <img
                                    src={`https://flagcdn.com/w40/${code}.png`}
                                    alt={code.toUpperCase()}
                                    width={24}
                                    height={18}
                                    style={{ width: "24px", height: "18px", objectFit: "cover", borderRadius: "2px" }}
                                    onError={(e) => {
                                      const el = e.currentTarget;
                                      el.style.display = "none";
                                      const fallback = el.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = "flex";
                                    }}
                                  />
                                  <span
                                    style={{
                                      display: "none",
                                      width: "22px", height: "22px",
                                      backgroundColor: "var(--adm-active-bg)",
                                      color: "var(--adm-active-text)",
                                      borderRadius: "50%",
                                      fontSize: "9px", fontWeight: 700,
                                      alignItems: "center", justifyContent: "center",
                                    }}
                                  >
                                    {code.toUpperCase()}
                                  </span>
                                </span>
                              );
                            })()}
                            <span className="text-xs font-mono font-semibold" style={{ color: "var(--adm-text)" }}>
                              {(order.country_code || selectedCountryCode || "QA").toUpperCase()}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "var(--adm-text-muted)" }}>
                          {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono text-sm" style={{ color: "var(--adm-text)" }}>
                          {Number(order.total_amount).toFixed(2)} {orderCurrency}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "var(--adm-text-muted)" }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            className="text-amber-400 hover:text-amber-300 transition-colors p-1 rounded-md"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Order Row */}
                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan={8} className="px-5 py-5 bg-[var(--adm-thead-bg)] border-t border-[var(--adm-border)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Items */}
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--adm-text-muted)] mb-3">
                                  Items Ordered ({Array.isArray(order.items) ? order.items.length : 0})
                                </p>
                                <div className="space-y-2.5">
                                  {Array.isArray(order.items) && order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-[var(--adm-card-bg)] rounded-lg border border-[var(--adm-border)]">
                                      {item.image_url && (
                                        <img
                                          src={item.image_url}
                                          alt={item.name}
                                          className="w-10 h-10 object-contain bg-[var(--adm-hover-bg)] rounded-lg p-1 flex-shrink-0"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-[var(--adm-text)] truncate">{item.name}</p>
                                        <p className="text-[10px] text-[var(--adm-text-muted)]">
                                          {item.volume ? `${item.volume} • ` : ""}
                                          {item.quantity} × {Number(item.price).toFixed(2)} {order.currency_code || currencyLabel}
                                        </p>
                                      </div>
                                      <p className="text-xs font-semibold text-amber-400 font-mono flex-shrink-0">
                                        {Number(item.line_total).toFixed(2)} {order.currency_code || currencyLabel}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[var(--adm-border)]">
                                  <p className="text-xs text-[var(--adm-text-muted)]">Total</p>
                                  <p className="text-sm font-bold text-[var(--adm-text)] font-mono">
                                    {Number(order.total_amount).toFixed(2)} {order.currency_code || currencyLabel}
                                  </p>
                                </div>
                              </div>

                              {/* Delivery Details */}
                              <div className="space-y-3">
                                <p className="text-[10px] uppercase tracking-wider text-[var(--adm-text-muted)] mb-1">
                                  Delivery Details
                                </p>
                                <div className="p-4 bg-[var(--adm-card-bg)] rounded-lg border border-[var(--adm-border)] space-y-2.5 text-xs">
                                  <div className="flex gap-3">
                                    <span className="text-[var(--adm-text-muted)] w-20 flex-shrink-0">Name</span>
                                    <span className="text-[var(--adm-text)]">{order.customer_name}</span>
                                  </div>
                                  <div className="flex gap-3">
                                    <span className="text-[var(--adm-text-muted)] w-20 flex-shrink-0">Phone</span>
                                    <span className="text-[var(--adm-text)]">{order.customer_phone}</span>
                                  </div>
                                  {order.customer_email && (
                                    <div className="flex gap-3">
                                      <span className="text-[var(--adm-text-muted)] w-20 flex-shrink-0">Email</span>
                                      <span className="text-[var(--adm-text)] truncate">{order.customer_email}</span>
                                    </div>
                                  )}
                                  <div className="flex gap-3">
                                    <span className="text-[var(--adm-text-muted)] w-20 flex-shrink-0">Address</span>
                                    <span className="text-[var(--adm-text)]">
                                      {order.delivery_address}, {order.delivery_city}
                                      {order.delivery_state ? `, ${order.delivery_state}` : ""}
                                      {order.delivery_postal_code ? ` - ${order.delivery_postal_code}` : ""}
                                    </span>
                                  </div>
                                  {order.delivery_slot && (
                                    <div className="flex gap-3">
                                      <span className="text-[var(--adm-text-muted)] w-20 flex-shrink-0">Time Slot</span>
                                      <span className="text-amber-400 font-mono font-medium">{order.delivery_slot}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Bottom 3-col widgets ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Order Status Donut */}
        <div
          className="border p-5"
          style={{ backgroundColor: "var(--adm-card-bg)", borderColor: "var(--adm-border)", borderRadius: "4px" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Order Status</h4>
          </div>
          {loading ? (
            <div className="animate-pulse h-36 rounded" style={{ backgroundColor: "var(--adm-hover-bg)" }} />
          ) : (
            <DonutChart data={statusGroups} />
          )}
        </div>

        {/* Top Products */}
        <div
          className="border p-5"
          style={{ backgroundColor: "var(--adm-card-bg)", borderColor: "var(--adm-border)", borderRadius: "4px" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Top Products</h4>
            <Link href="/admin/products" className="text-xs font-semibold transition-colors" style={{ color: "var(--adm-text-muted)" }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse h-8 rounded" style={{ backgroundColor: "var(--adm-hover-bg)" }} />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "var(--adm-text-muted)" }}>No product data</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((prod, i) => (
                <div key={prod.name} className="flex items-center gap-3">
                  {/* Image or placeholder */}
                  <div
                    className="w-9 h-9 flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "var(--adm-hover-bg)", color: "var(--adm-text-muted)", borderRadius: "4px" }}
                  >
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      prod.name[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--adm-text)" }}>{prod.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <InlineBar value={prod.orders} max={maxProductOrders} color={["#10b981","#3b82f6","#f97316","#7c3aed","#f59e0b"][i % 5]} />
                      <span className="text-[10px] font-bold flex-shrink-0" style={{ color: "var(--adm-text-muted)" }}>
                        {prod.orders} order{prod.orders !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div
          className="border p-5"
          style={{ backgroundColor: "var(--adm-card-bg)", borderColor: "var(--adm-border)", borderRadius: "4px" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Recent Customers</h4>
            <Link href="/admin/orders" className="text-xs font-semibold transition-colors" style={{ color: "var(--adm-text-muted)" }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse h-8 rounded" style={{ backgroundColor: "var(--adm-hover-bg)" }} />
              ))}
            </div>
          ) : recentCustomers.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "var(--adm-text-muted)" }}>No customer data</p>
          ) : (
            <div className="space-y-2.5">
              {recentCustomers.map((cust) => {
                const initial = (cust.name?.[0] || "?").toUpperCase();
                return (
                  <div key={cust.name} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "var(--adm-hover-bg)", color: "var(--adm-text)" }}
                    >
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--adm-text)" }}>{cust.name}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold flex-shrink-0 px-2 py-0.5"
                      style={{
                        backgroundColor: "var(--adm-hover-bg)",
                        color: "var(--adm-text-muted)",
                        borderRadius: "4px",
                      }}
                    >
                      {cust.orderCount} order{cust.orderCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
