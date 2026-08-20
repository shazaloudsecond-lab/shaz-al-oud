"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FeatureItem {
  icon_url: string;
  heading: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  { icon_url: "", heading: "" },
  { icon_url: "", heading: "" },
  { icon_url: "", heading: "" },
  { icon_url: "", heading: "" },
];

export default function AdminFeaturedBannerPage() {
  const [bannerId, setBannerId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const supabase = createClient();

        // Fetch featured_banner table row
        const { data: bannerData, error: bannerError } = await supabase
          .from("featured_banner")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (bannerError) {
          console.error("Error fetching featured banner:", bannerError);
        }

        if (bannerData) {
          setBannerId(bannerData.id);
          setImageUrl(bannerData.image_url || "");
          setBackgroundImageUrl(bannerData.background_image_url || "");
          setHeading(bannerData.heading || "");
          setSubheading(bannerData.subheading || "");

          if (bannerData.features) {
            const raw = typeof bannerData.features === "string" ? JSON.parse(bannerData.features) : bannerData.features;
            if (Array.isArray(raw) && raw.length > 0) {
              setFeatures([
                raw[0] || { icon_url: "", heading: "" },
                raw[1] || { icon_url: "", heading: "" },
                raw[2] || { icon_url: "", heading: "" },
                raw[3] || { icon_url: "", heading: "" },
              ]);
            }
          }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const handleImageUpload = async (file: File, target: "main" | "bg" | number) => {
    if (target === "main") {
      setUploadingMain(true);
    } else if (target === "bg") {
      setUploadingBg(true);
    } else {
      setUploadingItemIndex(target);
    }
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (target === "main") {
        setImageUrl(data.url);
      } else if (target === "bg") {
        setBackgroundImageUrl(data.url);
      } else {
        setFeatures((prev) => {
          const updated = [...prev];
          updated[target] = { ...updated[target], icon_url: data.url };
          return updated;
        });
      }
      setStatusMsg({ type: "success", text: "Image uploaded successfully!" });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      if (target === "main") {
        setUploadingMain(false);
      } else if (target === "bg") {
        setUploadingBg(false);
      } else {
        setUploadingItemIndex(null);
      }
    }
  };

  const updateFeatureItem = (index: number, field: "icon_url" | "heading", val: string) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      setStatusMsg({ type: "error", text: "Please provide a banner image." });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const payload = {
        image_url: imageUrl.trim(),
        heading: heading.trim() || null,
        subheading: subheading.trim() || null,
        background_image_url: backgroundImageUrl.trim() || null,
        features: features,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (bannerId) {
        const { error } = await supabase.from("featured_banner").update(payload).eq("id", bannerId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("featured_banner").insert([payload]).select("id").single();
        if (error) throw error;
        if (data) setBannerId(data.id);
      }

      setStatusMsg({ type: "success", text: "Featured banner saved directly to featured_banner table successfully!" });
    } catch (err: any) {
      console.error("Save error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save banner." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-neutral-800 rounded" />
        <div className="h-96 bg-neutral-900 border border-neutral-800 rounded-2xl" />
      </div>
    );
  }

  const quadrantLabels = [
    "Top-Left Feature (Quadrant 1)",
    "Top-Right Feature (Quadrant 2)",
    "Bottom-Left Feature (Quadrant 3)",
    "Bottom-Right Feature (Quadrant 4)",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-medium text-white tracking-wide">Featured Banner</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Configure the featured banner with background image, left-side content, bottom 2x2 plus feature grid, and right-side image.
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
          <button type="button" onClick={() => setStatusMsg(null)} className="text-neutral-400 hover:text-white text-xs ml-4">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Main Banner Settings */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            1. Main Banner Settings
          </h3>

          {/* Section Background Image Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                Section Background Image <span className="text-neutral-500 font-normal">(Optional — Solid black if empty)</span>
              </label>
              {backgroundImageUrl && (
                <button
                  type="button"
                  onClick={() => setBackgroundImageUrl("")}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Clear Background
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploadingBg ? "Uploading..." : "Upload BG Image"}</span>
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
                placeholder="or paste background image URL..."
                className="flex-1 w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
              />
            </div>
            {backgroundImageUrl && (
              <div className="mt-4 relative h-36 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                <img src={backgroundImageUrl} alt="Background Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-xs text-white/80 uppercase tracking-widest bg-black/60 px-3 py-1 rounded">Background Preview</span>
                </div>
              </div>
            )}
          </div>

          {/* Right-side banner image */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Right-Side Banner Image <span className="text-amber-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploadingMain ? "Uploading..." : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingMain}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "main");
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="or paste image URL..."
                className="flex-1 w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
              />
            </div>
            {imageUrl && (
              <div className="mt-4 relative h-48 sm:h-64 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Left-Side Heading
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. More Than A Perfume"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Left-Side Subheading
            </label>
            <textarea
              rows={2}
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. A scent that reflects your personality and creates lasting memories"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Section 2: 4 Feature Grid Items ("Plus" Design) */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              2. Left-Side Feature Grid (4 Quadrants "Plus" Design)
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Upload an icon and provide a title for each quadrant. Stored directly in the featured_banner table as JSON.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((item, idx) => (
              <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    {quadrantLabels[idx]}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-mono">
                    Item {idx + 1}
                  </span>
                </div>

                {/* Heading */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                    Heading / Title
                  </label>
                  <input
                    type="text"
                    value={item.heading}
                    onChange={(e) => updateFeatureItem(idx, "heading", e.target.value)}
                    placeholder={
                      idx === 0
                        ? "e.g. The Everyday Fragrance Lover"
                        : idx === 1
                        ? "e.g. The Smart Shopper"
                        : idx === 2
                        ? "e.g. Gift Buyers"
                        : "e.g. The Fragrance Explorer"
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                  />
                </div>

                {/* Icon Upload / URL */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400">
                    Icon (Upload or URL)
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-1.5 flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{uploadingItemIndex === idx ? "..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingItemIndex === idx}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, idx);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      value={item.icon_url}
                      onChange={(e) => updateFeatureItem(idx, "icon_url", e.target.value)}
                      placeholder="Icon URL..."
                      className="flex-1 w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                    />
                  </div>

                  {/* Icon Preview */}
                  {item.icon_url && (
                    <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                      <div className="w-10 h-10 rounded border border-[#dfc3b4]/30 bg-black/60 flex items-center justify-center p-1.5">
                        <img src={item.icon_url} alt="Icon Preview" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[11px] text-neutral-400 truncate flex-1">{item.icon_url}</span>
                      <button
                        type="button"
                        onClick={() => updateFeatureItem(idx, "icon_url", "")}
                        className="text-xs text-neutral-500 hover:text-red-400 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving || uploadingMain || uploadingBg || uploadingItemIndex !== null}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer font-medium"
          >
            {saving ? "Saving..." : "Save Featured Banner"}
          </button>
        </div>
      </form>
    </div>
  );
}
