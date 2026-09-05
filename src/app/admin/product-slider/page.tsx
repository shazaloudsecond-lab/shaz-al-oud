"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminContext } from "@/context/AdminContext";

interface SelectedItem {
  product_id: string;
}

export default function ProductSliderAdminPage() {
  const { products } = useAdminContext();

  const [configId, setConfigId] = useState<string | null>(null);
  const [heading, setHeading] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        const { data: configData } = await supabase
          .from("product_slider_config")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (configData) {
          setConfigId(configData.id);
          setHeading(configData.heading || "");
        }

        const { data: itemsData } = await supabase
          .from("product_slider_items")
          .select("product_id")
          .order("display_order", { ascending: true });

        if (itemsData) {
          setSelectedItems(
            itemsData.map((item) => ({
              product_id: item.product_id,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching product slider config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleProduct = (productId: string) => {
    setSelectedItems((prev) => {
      if (prev.find((i) => i.product_id === productId)) {
        return prev.filter((i) => i.product_id !== productId);
      } else {
        return [...prev, { product_id: productId }];
      }
    });
  };

  const moveProduct = (index: number, direction: "up" | "down") => {
    const newItems = [...selectedItems];
    if (direction === "up" && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    }
    setSelectedItems(newItems);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();

      if (configId) {
        const { error } = await supabase
          .from("product_slider_config")
          .update({ heading: heading.trim() || null })
          .eq("id", configId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("product_slider_config")
          .insert([{ heading: heading.trim() || null }])
          .select("id")
          .single();
        if (error) throw error;
        if (data) setConfigId(data.id);
      }

      // Delete all existing items then re-insert with updated order
      await supabase.from("product_slider_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (selectedItems.length > 0) {
        const insertData = selectedItems.map((item, idx) => ({
          product_id: item.product_id,
          display_order: idx + 1,
        }));
        const { error: itemsError } = await supabase.from("product_slider_items").insert(insertData);
        if (itemsError) throw itemsError;
      }

      setStatusMsg({ type: "success", text: "Product Slider configured successfully!" });
    } catch (err: any) {
      console.error("Save error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save configuration." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-neutral-800 rounded" />
        <div className="h-[500px] bg-neutral-900 border border-neutral-800 rounded-2xl" />
      </div>
    );
  }

  const selectedProductDetails = selectedItems.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.product_id),
  }));

  const selectedProductIds = selectedItems.map((i) => i.product_id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-medium text-white tracking-wide">Product Slider Configuration</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Select products and reorder them for the homepage slider.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
              : "bg-red-950/50 border-red-800/80 text-red-300"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="text-neutral-400 hover:text-white text-xs ml-4">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">

          {/* Heading */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">Section Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Made to be remembered."
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>

          {/* Selected Products */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Selected Products ({selectedItems.length})
            </label>
            <p className="text-xs text-neutral-500">Use arrows to reorder selected products for the slider.</p>

            <div className="space-y-2 mt-4">
              {selectedProductDetails.length === 0 ? (
                <div className="p-6 text-center text-sm text-neutral-500 bg-neutral-950 rounded-xl border border-neutral-800 border-dashed">
                  No products selected. Click products below to add them.
                </div>
              ) : (
                selectedProductDetails.map((item, idx) => {
                  const prod = item.product;
                  if (!prod) return null;
                  return (
                    <div key={item.product_id} className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-xl gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Product Image Preview */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 border border-neutral-800">
                          {prod.image_url && (
                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-neutral-200 font-medium truncate">{prod.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{prod.category?.name || "Uncategorized"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button" onClick={() => moveProduct(idx, "up")} disabled={idx === 0}
                          className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-neutral-900 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button type="button" onClick={() => moveProduct(idx, "down")} disabled={idx === selectedItems.length - 1}
                          className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed bg-neutral-900 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <button type="button" onClick={() => handleToggleProduct(item.product_id)}
                          className="p-2 text-red-400 hover:bg-red-950 hover:text-red-300 bg-neutral-900 rounded-lg transition-colors ml-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Available Products */}
          <div className="space-y-3 pt-6">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">Available Products</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((prod) => {
                const isSelected = selectedProductIds.includes(prod.id);
                return (
                  <div key={prod.id} onClick={() => handleToggleProduct(prod.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isSelected ? "bg-amber-950/20 border-amber-900/50 opacity-50" : "bg-neutral-950 border-neutral-800 hover:border-neutral-600"
                    }`}>
                    <div className="w-10 h-10 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
                      {prod.image_url && <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 font-medium truncate">{prod.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{prod.category?.name || "Uncategorized"}</p>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button type="submit" disabled={saving}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer">
            {saving ? "Saving..." : "Save Product Slider"}
          </button>
        </div>
      </form>
    </div>
  );
}
