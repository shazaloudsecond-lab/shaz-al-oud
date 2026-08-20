"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminContext } from "@/context/AdminContext";

type LinkType = "product" | "category" | "custom" | "none";

interface BannerConfig {
  imageUrl: string;
  heading: string;
  subheading: string;
  linkType: LinkType;
  selectedId: string;
  customUrl: string;
}

export default function AdminBannersPage() {
  const { products, categories } = useAdminContext();

  const [bannerId, setBannerId] = useState<string | null>(null);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");

  const [leftBanner, setLeftBanner] = useState<BannerConfig>({
    imageUrl: "",
    heading: "",
    subheading: "",
    linkType: "none",
    selectedId: "",
    customUrl: "",
  });

  const [rightBanner, setRightBanner] = useState<BannerConfig>({
    imageUrl: "",
    heading: "",
    subheading: "",
    linkType: "none",
    selectedId: "",
    customUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingLeft, setUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper to determine link URL from config
  const computeLink = (config: BannerConfig): string => {
    if (config.linkType === "product") {
      return config.selectedId ? `/products/${config.selectedId}` : "#";
    }
    if (config.linkType === "category") {
      return config.selectedId ? `/#categories` : "#";
    }
    if (config.linkType === "custom") {
      return config.customUrl.trim() || "#";
    }
    return "#";
  };

  // Helper to parse stored link URL into config
  const parseStoredLink = (link: string | null | undefined): { linkType: LinkType; selectedId: string; customUrl: string } => {
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

  // Fetch current banner configuration from Supabase
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const supabase = createClient();
        const [bannerRes, settingsRes] = await Promise.all([
          supabase
            .from("promo_banners")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("admin_settings")
            .select("key, value")
            .eq("key", "promo_banner_extended")
            .maybeSingle(),
        ]);

        if (bannerRes.error) {
          console.error("Error loading promotional banners:", bannerRes.error);
        }

        let extendedData: any = {};
        if (settingsRes.data?.value) {
          try {
            extendedData = JSON.parse(settingsRes.data.value);
          } catch (e) {
            console.error("Error parsing promo_banner_extended:", e);
          }
        }

        if (bannerRes.data) {
          setBannerId(bannerRes.data.id);
          setHeading(bannerRes.data.heading || "");
          const leftParsed = parseStoredLink(bannerRes.data.left_link);
          const rightParsed = parseStoredLink(bannerRes.data.right_link);

          setSubheading(extendedData.subheading || (bannerRes.data as any).subheading || "");
          setBackgroundImageUrl(extendedData.background_image_url || (bannerRes.data as any).background_image_url || "");

          setLeftBanner({
            imageUrl: bannerRes.data.left_image_url || "",
            heading: extendedData.left_heading || (bannerRes.data as any).left_heading || "",
            subheading: extendedData.left_subheading || (bannerRes.data as any).left_subheading || "",
            ...leftParsed,
          });

          setRightBanner({
            imageUrl: bannerRes.data.right_image_url || "",
            heading: extendedData.right_heading || (bannerRes.data as any).right_heading || "",
            subheading: extendedData.right_subheading || (bannerRes.data as any).right_subheading || "",
            ...rightParsed,
          });
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleImageUpload = async (file: File, target: "bg" | "left" | "right") => {
    if (target === "bg") setUploadingBg(true);
    if (target === "left") setUploadingLeft(true);
    if (target === "right") setUploadingRight(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (target === "bg") {
        setBackgroundImageUrl(data.url);
        setStatusMsg({ type: "success", text: "Background image uploaded successfully!" });
      } else if (target === "left") {
        setLeftBanner((prev) => ({ ...prev, imageUrl: data.url }));
        setStatusMsg({ type: "success", text: "Left banner image uploaded successfully!" });
      } else {
        setRightBanner((prev) => ({ ...prev, imageUrl: data.url }));
        setStatusMsg({ type: "success", text: "Right banner image uploaded successfully!" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      if (target === "bg") setUploadingBg(false);
      if (target === "left") setUploadingLeft(false);
      if (target === "right") setUploadingRight(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leftBanner.imageUrl.trim() || !rightBanner.imageUrl.trim()) {
      setStatusMsg({
        type: "error",
        text: "Please provide both Left and Right banner images.",
      });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const payload = {
        heading: heading.trim() || null,
        left_image_url: leftBanner.imageUrl.trim(),
        left_link: computeLink(leftBanner),
        right_image_url: rightBanner.imageUrl.trim(),
        right_link: computeLink(rightBanner),
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const extendedPayload = {
        subheading: subheading.trim() || null,
        background_image_url: backgroundImageUrl.trim() || null,
        left_heading: leftBanner.heading.trim() || null,
        left_subheading: leftBanner.subheading.trim() || null,
        right_heading: rightBanner.heading.trim() || null,
        right_subheading: rightBanner.subheading.trim() || null,
      };

      // 1. Save base row to promo_banners
      if (bannerId) {
        const { error } = await supabase
          .from("promo_banners")
          .update(payload)
          .eq("id", bannerId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("promo_banners")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        if (data) setBannerId(data.id);
      }

      // 2. Save extended fields in admin_settings key promo_banner_extended
      const { error: settingsError } = await supabase
        .from("admin_settings")
        .upsert(
          {
            key: "promo_banner_extended",
            value: JSON.stringify(extendedPayload),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

      if (settingsError) {
        console.error("Warning saving extended settings:", settingsError);
      }

      setStatusMsg({ type: "success", text: "Promotional banners published successfully!" });
    } catch (err: any) {
      console.error("Save promo banners error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save promotional banners." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-neutral-800 rounded" />
            <div className="h-4 w-80 bg-neutral-800/60 rounded" />
          </div>
          <div className="h-9 w-32 bg-neutral-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-neutral-900 border border-neutral-800 rounded-2xl p-6" />
          <div className="h-96 bg-neutral-900 border border-neutral-800 rounded-2xl p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-white tracking-wide">Promotional 2-Image Banners</h2>
          <p className="text-sm text-neutral-400">
            Configure section title, subtitle, background image, and side-by-side promotional highlight banners.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
              : "bg-red-950/50 border-red-800/80 text-red-300"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-neutral-400 hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-8">

        {/* Section Heading & Subheading & Background */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
              Section Header & Background
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section Heading */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                Section Heading
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Craft Your Signature Essence"
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
              <p className="text-[11px] text-neutral-500">Main section title displayed centered at the top.</p>
            </div>

            {/* Section Subheading */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                Section Subheading
              </label>
              <textarea
                rows={2}
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                placeholder="e.g. A fragrance is more than a scent — it's an expression of who you are. Curated with precision, blended with passion."
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs resize-none"
              />
              <p className="text-[11px] text-neutral-500">Descriptive subtitle shown beneath the heading.</p>
            </div>
          </div>

          {/* Section Background Image Upload */}
          <div className="space-y-3 pt-4 border-t border-neutral-800/80">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Section Background Image (Optional)
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2 flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploadingBg ? "Uploading..." : "Upload Background"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingBg}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "bg");
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                placeholder="or paste direct background image URL https://..."
                className="flex-1 w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
              />

              {backgroundImageUrl && (
                <button
                  type="button"
                  onClick={() => setBackgroundImageUrl("")}
                  className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {backgroundImageUrl && (
              <div className="relative h-20 w-full max-w-md rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 mt-2">
                <img src={backgroundImageUrl} alt="Section Background Preview" className="w-full h-full object-cover opacity-70" />
                <span className="absolute bottom-1 right-2 text-[10px] text-neutral-400 bg-black/60 px-1.5 py-0.5 rounded">
                  Background Preview
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BANNERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT BANNER CARD */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
                    Left Banner Card
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">1/2</span>
              </div>

              {/* Image Upload & Input */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Banner Image <span className="text-amber-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{uploadingLeft ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLeft}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "left");
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    value={leftBanner.imageUrl}
                    onChange={(e) => setLeftBanner((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="or paste direct image URL https://..."
                    className="flex-1 w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                  />
                </div>
              </div>

              {/* Card Heading & Subheading */}
              <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                    Card Heading
                  </label>
                  <input
                    type="text"
                    value={leftBanner.heading}
                    onChange={(e) => setLeftBanner((prev) => ({ ...prev, heading: e.target.value }))}
                    placeholder="e.g. CRAFTED WITH CARE"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                    Card Subheading
                  </label>
                  <textarea
                    rows={2}
                    value={leftBanner.subheading}
                    onChange={(e) => setLeftBanner((prev) => ({ ...prev, subheading: e.target.value }))}
                    placeholder="e.g. Each note is carefully selected and blended to perfection."
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs resize-none"
                  />
                </div>
              </div>

              {/* Link Target Selector */}
              <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Banner Click Action
                </label>

                {/* Link Type Selector Tabs */}
                <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-neutral-100 border border-neutral-300">
                  {(["none", "product", "category", "custom"] as LinkType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLeftBanner((prev) => ({ ...prev, linkType: type }))}
                      className={`py-2 px-3 text-xs capitalize transition-all cursor-pointer ${
                        leftBanner.linkType === type
                          ? "admin-tab-btn-active bg-black text-white font-bold"
                          : "admin-tab-btn-inactive bg-transparent text-neutral-700 hover:bg-white hover:text-black font-semibold"
                      }`}
                    >
                      {type === "none" ? "No Link" : type}
                    </button>
                  ))}
                </div>

                {/* Product Dropdown */}
                {leftBanner.linkType === "product" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-neutral-400">Select Target Product:</label>
                    <select
                      value={leftBanner.selectedId}
                      onChange={(e) => setLeftBanner((prev) => ({ ...prev, selectedId: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors text-xs cursor-pointer"
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
                {leftBanner.linkType === "category" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-neutral-400">Select Target Category:</label>
                    <select
                      value={leftBanner.selectedId}
                      onChange={(e) => setLeftBanner((prev) => ({ ...prev, selectedId: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors text-xs cursor-pointer"
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
                {leftBanner.linkType === "custom" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-neutral-400">Custom Target URL:</label>
                    <input
                      type="text"
                      value={leftBanner.customUrl}
                      onChange={(e) => setLeftBanner((prev) => ({ ...prev, customUrl: e.target.value }))}
                      placeholder="e.g. /offers or https://..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Left Preview */}
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <span className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Live Card Preview:</span>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                {leftBanner.imageUrl ? (
                  <>
                    <img src={leftBanner.imageUrl} alt="Left Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                      {leftBanner.heading && (
                        <span className="text-xs font-semibold text-[#dfc3b4] uppercase tracking-wider">
                          {leftBanner.heading}
                        </span>
                      )}
                      {leftBanner.subheading && (
                        <span className="text-[10px] text-neutral-300 line-clamp-2 mt-0.5">
                          {leftBanner.subheading}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-neutral-600 italic">No image uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT BANNER CARD */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
                    Right Banner Card
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">2/2</span>
              </div>

              {/* Image Upload & Input */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Banner Image <span className="text-amber-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{uploadingRight ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingRight}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "right");
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="url"
                    value={rightBanner.imageUrl}
                    onChange={(e) => setRightBanner((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="or paste direct image URL https://..."
                    className="flex-1 w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                  />
                </div>
              </div>

              {/* Card Heading & Subheading */}
              <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                    Card Heading
                  </label>
                  <input
                    type="text"
                    value={rightBanner.heading}
                    onChange={(e) => setRightBanner((prev) => ({ ...prev, heading: e.target.value }))}
                    placeholder="e.g. ELEGANCE IN EVERY DROP"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                    Card Subheading
                  </label>
                  <textarea
                    rows={2}
                    value={rightBanner.subheading}
                    onChange={(e) => setRightBanner((prev) => ({ ...prev, subheading: e.target.value }))}
                    placeholder="e.g. Timeless blends designed to leave a lasting impression."
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs resize-none"
                  />
                </div>
              </div>

              {/* Link Target Selector */}
              <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Banner Click Action
                </label>

                {/* Link Type Selector Tabs */}
                <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-neutral-100 border border-neutral-300">
                  {(["none", "product", "category", "custom"] as LinkType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRightBanner((prev) => ({ ...prev, linkType: type }))}
                      className={`py-2 px-3 text-xs capitalize transition-all cursor-pointer ${
                        rightBanner.linkType === type
                          ? "admin-tab-btn-active bg-black text-white font-bold"
                          : "admin-tab-btn-inactive bg-transparent text-neutral-700 hover:bg-white hover:text-black font-semibold"
                      }`}
                    >
                      {type === "none" ? "No Link" : type}
                    </button>
                  ))}
                </div>

                {/* Product Dropdown */}
                {rightBanner.linkType === "product" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-neutral-400">Select Target Product:</label>
                    <select
                      value={rightBanner.selectedId}
                      onChange={(e) => setRightBanner((prev) => ({ ...prev, selectedId: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors text-xs cursor-pointer"
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
                {rightBanner.linkType === "category" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-neutral-400">Select Target Category:</label>
                    <select
                      value={rightBanner.selectedId}
                      onChange={(e) => setRightBanner((prev) => ({ ...prev, selectedId: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors text-xs cursor-pointer"
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
                {rightBanner.linkType === "custom" && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-neutral-400">Custom Target URL:</label>
                    <input
                      type="text"
                      value={rightBanner.customUrl}
                      onChange={(e) => setRightBanner((prev) => ({ ...prev, customUrl: e.target.value }))}
                      placeholder="e.g. /offers or https://..."
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Preview */}
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <span className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Live Card Preview:</span>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                {rightBanner.imageUrl ? (
                  <>
                    <img src={rightBanner.imageUrl} alt="Right Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                      {rightBanner.heading && (
                        <span className="text-xs font-semibold text-[#dfc3b4] uppercase tracking-wider">
                          {rightBanner.heading}
                        </span>
                      )}
                      {rightBanner.subheading && (
                        <span className="text-[10px] text-neutral-300 line-clamp-2 mt-0.5">
                          {rightBanner.subheading}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-neutral-600 italic">No image uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving || uploadingBg || uploadingLeft || uploadingRight}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer font-medium"
          >
            {saving ? "Saving Banners..." : "Publish Banners to Store"}
          </button>
        </div>
      </form>
    </div>
  );
}
