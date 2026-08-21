"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminContext } from "@/context/AdminContext";
import { deleteCloudinaryAsset } from "@/lib/cloudinaryClient";
import AdminDeleteModal from "@/components/admin/AdminDeleteModal";
import AdminUploadProgress from "@/components/admin/AdminUploadProgress";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

type LinkType = "product" | "category" | "custom" | "none";

export default function AdminFullBannerPage() {
  const { products, categories, loadingProducts, loadingCategories } = useAdminContext();

  const [bannerId, setBannerId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("Discover Now");
  const [linkType, setLinkType] = useState<LinkType>("none");
  const [selectedId, setSelectedId] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete/Remove modal
  const [removeModalOpen, setRemoveModalOpen] = useState(false);

  // Helper to determine link URL from config
  const computeLink = (): string => {
    if (linkType === "product") {
      return selectedId ? `/products/${selectedId}` : "#";
    }
    if (linkType === "category") {
      return selectedId ? `/#categories` : "#";
    }
    if (linkType === "custom") {
      return customUrl.trim() || "#";
    }
    return "#";
  };

  // Helper to parse stored link URL into config
  const parseStoredLink = (
    link: string | null | undefined,
    storedType?: string | null,
    storedId?: string | null
  ): { linkType: LinkType; selectedId: string; customUrl: string } => {
    if (storedType === "product" || storedType === "category" || storedType === "custom" || storedType === "none") {
      return {
        linkType: storedType,
        selectedId: storedId || "",
        customUrl: storedType === "custom" ? link || "" : "",
      };
    }

    if (!link || link === "#") {
      return { linkType: "none", selectedId: "", customUrl: "" };
    }
    if (link.startsWith("/products/")) {
      const prodId = link.replace("/products/", "");
      return { linkType: "product", selectedId: prodId, customUrl: "" };
    }
    if (link.startsWith("/#categories") || link.startsWith("/categories/")) {
      return { linkType: "category", selectedId: "", customUrl: "" };
    }
    return { linkType: "custom", selectedId: "", customUrl: link };
  };

  // ─── Fetch existing banner ────────────────────────────────────────
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("full_banner")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) console.error("Error fetching full banner:", error);

        if (data) {
          setBannerId(data.id);
          setImageUrl(data.image_url || "");
          setButtonText(data.button_text !== undefined && data.button_text !== null ? data.button_text : "Discover Now");

          const parsed = parseStoredLink(data.link_url, data.link_type, data.selected_id);
          setLinkType(parsed.linkType);
          setSelectedId(parsed.selectedId);
          setCustomUrl(parsed.customUrl);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  // ─── Upload image ─────────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setStatusMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await uploadWithProgress("/api/upload", formData, (pct) => {
        setUploadProgress(pct);
      });
      if (data.url) {
        setImageUrl(data.url as string);
        setStatusMsg({ type: "success", text: "Image uploaded successfully!" });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      setStatusMsg({ type: "error", text: "Please provide a banner image." });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    const calculatedLink = computeLink();

    try {
      const supabase = createClient();
      const payload = {
        image_url: imageUrl.trim(),
        link_url: calculatedLink !== "#" ? calculatedLink : null,
        button_text: buttonText.trim() || null,
        link_type: linkType,
        selected_id: selectedId || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (bannerId) {
        const { error } = await supabase.from("full_banner").update(payload).eq("id", bannerId);
        if (error) throw error;
        setStatusMsg({ type: "success", text: "Banner updated successfully!" });
      } else {
        const { data, error } = await supabase.from("full_banner").insert([payload]).select("id").single();
        if (error) throw error;
        if (data) setBannerId(data.id);
        setStatusMsg({ type: "success", text: "Banner published successfully!" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save banner." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;
    await deleteCloudinaryAsset(imageUrl);
    setImageUrl("");
    if (bannerId) {
      try {
        const supabase = createClient();
        await supabase
          .from("full_banner")
          .update({ image_url: "", updated_at: new Date().toISOString() })
          .eq("id", bannerId);
      } catch (e) {
        console.error("Error deleting full banner image in DB:", e);
      }
    }
  };

  // ─── Remove banner ────────────────────────────────────────────────
  const handleConfirmRemove = async () => {
    if (!bannerId) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("full_banner").update({ is_active: false }).eq("id", bannerId);
      if (error) throw error;
      setStatusMsg({ type: "success", text: "Banner hidden from storefront." });
      setRemoveModalOpen(false);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to remove banner." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────
  if (loading || loadingProducts || loadingCategories) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-neutral-800 rounded" />
        <div className="h-72 bg-neutral-900 border border-neutral-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-medium text-white tracking-wide">Full Banner Management</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Upload a full-width banner image and configure its bottom-right action button.
        </p>
      </div>

      {/* Status */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
              : "bg-red-950/50 border-red-800/80 text-red-300"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="text-neutral-400 hover:text-white text-xs ml-4 cursor-pointer">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">

          {/* Image upload */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Banner Image <span className="text-amber-500">*</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploading ? "Uploading…" : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="or paste image URL…"
                className="flex-1 w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
              />

              {imageUrl && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="px-3 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors flex-shrink-0"
                  title="Delete Banner Image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Image
                </button>
              )}
            </div>

            {/* Upload Progress */}
            <AdminUploadProgress
              progress={uploadProgress}
              isUploading={uploading}
              title="Uploading Banner Image"
              className="mt-2"
            />
          </div>

          {/* Button Settings Section */}
          <div className="space-y-4 pt-5 border-t border-neutral-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Bottom-Right Action Button
            </h3>

            {/* Button Text */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Discover Now, Explore Collection, Shop Now"
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            {/* Link Destination Type Selection */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                Button Link Destination
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-neutral-100 border border-neutral-300">
                {[
                  { type: "none" as LinkType, label: "No Link" },
                  { type: "product" as LinkType, label: "Product" },
                  { type: "category" as LinkType, label: "Category" },
                  { type: "custom" as LinkType, label: "Custom URL" },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setLinkType(item.type);
                      setSelectedId("");
                    }}
                    className={`py-2 px-3 text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      linkType === item.type
                        ? "admin-tab-btn-active bg-black text-white font-bold"
                        : "admin-tab-btn-inactive bg-transparent text-neutral-700 hover:bg-white hover:text-black font-semibold"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Dropdown */}
            {linkType === "product" && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Select Target Product:
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors text-xs cursor-pointer"
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${Number(p.price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Dropdown */}
            {linkType === "category" && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Select Target Category:
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors text-xs cursor-pointer"
                >
                  <option value="">-- Choose a Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom URL Input */}
            {linkType === "custom" && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Custom Target URL:
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="e.g. /products or https://..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                />
              </div>
            )}
          </div>

          {/* Live Preview */}
          {imageUrl && (
            <div className="space-y-2 pt-4 border-t border-neutral-800">
              <span className="block text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Live Banner Preview:
              </span>
              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <img src={imageUrl} alt="Banner Preview" className="w-full h-auto block" />
                {buttonText && (
                  <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 pointer-events-none">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-black font-semibold text-[11px] tracking-widest uppercase shadow-2xl">
                      <span>{buttonText}</span>
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute top-2 right-2 px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-lg transition-colors"
                  title="Delete Image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {bannerId && (
            <button
              type="button"
              onClick={() => setRemoveModalOpen(true)}
              disabled={saving}
              className="text-xs text-red-400 hover:text-red-300 uppercase font-medium transition-colors cursor-pointer"
            >
              Hide from Storefront
            </button>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              {saving ? "Saving…" : "Save Banner"}
            </button>
          </div>
        </div>
      </form>

      {/* Delete/Remove Banner Modal */}
      <AdminDeleteModal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Hide Banner from Storefront"
        message="Are you sure you want to hide this full banner from the storefront? You can re-enable and publish it anytime."
        loading={saving}
        confirmText="Hide Banner"
      />
    </div>
  );
}
