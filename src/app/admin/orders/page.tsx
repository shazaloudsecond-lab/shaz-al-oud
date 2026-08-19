"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAdminContext } from "@/context/AdminContext";

interface OrderItem {
  name: string;
  volume?: string | null;
  brand_name?: string | null;
  quantity: number;
  price: number;
  original_price?: number | null;
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
  whatsapp_phone?: string | null;
}

const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];

const statusColors: Record<string, string> = {
  pending: "text-orange-500 font-bold",
  processing: "text-yellow-500 font-bold",
  completed: "text-emerald-600 font-bold",
  cancelled: "text-red-600 font-bold",
};

export default function AdminOrdersPage() {
  const { selectedCountryCode, selectedCountry } = useAdminContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setSuccessMsg("Order status updated successfully.");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders strictly by selected country
  const countryOrders = useMemo(() => {
    if (!selectedCountryCode) return orders;
    return orders.filter((order) => {
      const orderCountry = order.country_code ? order.country_code.toUpperCase().trim() : "QA";
      return orderCountry === selectedCountryCode.toUpperCase().trim();
    });
  }, [orders, selectedCountryCode]);

  // Filtering + searching within country-specific orders
  const filteredOrders = useMemo(() => {
    return countryOrders.filter((order) => {
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        (order.customer_email?.toLowerCase() || "").includes(q) ||
        order.customer_phone.includes(q) ||
        order.delivery_city.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [countryOrders, filterStatus, searchQuery]);

  const currencyLabel = selectedCountry?.currency_code || "QAR";

  const totalRevenue = useMemo(() => {
    return countryOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  }, [countryOrders]);

  const pendingCount = countryOrders.filter((o) => o.status === "pending").length;
  const completedCount = countryOrders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-white tracking-wide">
            Orders ({selectedCountry?.name || "Qatar"})
          </h2>
          <p className="text-sm text-neutral-400">
            {countryOrders.length} total order{countryOrders.length !== 1 ? "s" : ""} in {selectedCountry?.name || "Qatar"} •{" "}
            <span className="text-amber-400">{pendingCount} pending</span>
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: countryOrders.length.toString(),
            cardClass: "admin-stat-card-blue",
            bgColor: "#dbeafe",
            borderColor: "#93c5fd",
            titleColor: "#1e40af",
            valueColor: "#1d4ed8",
          },
          {
            label: `Total Revenue (${currencyLabel})`,
            value: `${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel}`,
            cardClass: "admin-stat-card-emerald",
            bgColor: "#dcfce7",
            borderColor: "#86efac",
            titleColor: "#166534",
            valueColor: "#15803d",
          },
          {
            label: "Pending",
            value: pendingCount.toString(),
            cardClass: "admin-stat-card-amber",
            bgColor: "#fef3c7",
            borderColor: "#fde047",
            titleColor: "#854d0e",
            valueColor: "#a16207",
          },
          {
            label: "Completed",
            value: completedCount.toString(),
            cardClass: "admin-stat-card-purple",
            bgColor: "#f3e8ff",
            borderColor: "#d8b4fe",
            titleColor: "#6b21a8",
            valueColor: "#7e22ce",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{ backgroundColor: stat.bgColor, borderColor: stat.borderColor }}
            className={`admin-stat-card ${stat.cardClass} p-4 border transition-colors shadow-sm`}
          >
            <p style={{ color: stat.titleColor }} className="text-[10px] uppercase tracking-wider font-bold">
              {stat.label}
            </p>
            <p style={{ color: stat.valueColor }} className="text-xl font-extrabold mt-1.5 font-mono">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm">
          {successMsg}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${selectedCountry?.name || "Qatar"} orders by #, customer, phone, city...`}
          className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm transition-colors"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500 text-sm transition-colors cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-neutral-500 animate-pulse">
            <svg className="w-8 h-8 mx-auto text-neutral-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm">Fetching orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            <svg className="w-8 h-8 mx-auto text-neutral-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm">
              {searchQuery || filterStatus !== "all"
                ? "No orders match your filters."
                : `No orders placed for ${selectedCountry?.name || "Qatar"} yet.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/60 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Update Status</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-amber-400/90 whitespace-nowrap">
                        {order.order_number}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-neutral-200 text-sm">{order.customer_name}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{order.customer_phone}</p>
                          {order.customer_email && (
                            <p className="text-xs text-neutral-600 mt-0.5">{order.customer_email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-black text-sm">
                          {Number(order.total_amount).toFixed(2)} {order.currency_code || currencyLabel}
                        </div>
                        <div className="text-[10px] text-neutral-600 font-mono font-medium mt-0.5 uppercase">
                          {order.country_name || selectedCountry?.name || "Qatar"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center text-xs font-bold uppercase tracking-wider ${statusColors[order.status] || "text-neutral-700 font-bold"}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500 text-xs cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                            }
                            className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {expandedOrderId === order.id ? "Hide" : "View"}
                          </button>
                          <Link
                            href={`/orders/${order.order_number}`}
                            target="_blank"
                            className="text-xs text-neutral-400 hover:text-white transition-colors"
                          >
                            ↗
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Order Row */}
                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan={7} className="px-5 py-5 bg-neutral-950/60 border-t border-neutral-800/60">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-3">
                                Items Ordered ({Array.isArray(order.items) ? order.items.length : 0})
                              </p>
                              <div className="space-y-2.5">
                                {Array.isArray(order.items) && order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-neutral-900 rounded-lg border border-neutral-800/60">
                                    {item.image_url && (
                                      <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-10 h-10 object-contain bg-neutral-800 rounded-lg p-1 flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-neutral-200 truncate">{item.name}</p>
                                      <p className="text-[10px] text-neutral-500">
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
                              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-neutral-800">
                                <p className="text-xs text-neutral-400">Total</p>
                                <p className="text-sm font-bold text-white font-mono">
                                  {Number(order.total_amount).toFixed(2)} {order.currency_code || currencyLabel}
                                </p>
                              </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="space-y-3">
                              <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                                Delivery Details
                              </p>
                              <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800/60 space-y-2.5 text-xs">
                                <div className="flex gap-3">
                                  <span className="text-neutral-500 w-20 flex-shrink-0">Name</span>
                                  <span className="text-neutral-200">{order.customer_name}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="text-neutral-500 w-20 flex-shrink-0">Phone</span>
                                  <span className="text-neutral-200">{order.customer_phone}</span>
                                </div>
                                {order.customer_email && (
                                  <div className="flex gap-3">
                                    <span className="text-neutral-500 w-20 flex-shrink-0">Email</span>
                                    <span className="text-neutral-200 truncate">{order.customer_email}</span>
                                  </div>
                                )}
                                <div className="flex gap-3">
                                  <span className="text-neutral-500 w-20 flex-shrink-0">Address</span>
                                  <span className="text-neutral-200">
                                    {order.delivery_address}, {order.delivery_city}
                                    {order.delivery_state ? `, ${order.delivery_state}` : ""}
                                    {order.delivery_postal_code ? ` - ${order.delivery_postal_code}` : ""}
                                  </span>
                                </div>
                                {order.delivery_slot && (
                                  <div className="flex gap-3">
                                    <span className="text-neutral-500 w-20 flex-shrink-0">Time Slot</span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
