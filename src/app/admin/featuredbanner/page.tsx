"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminFeaturedBannerPage() {
  const [bannerId, setBannerId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("featured_banner")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching featured banner:", error);
        }

        if (data) {
          setBannerId(data.id);
          setImageUrl(data.image_url || "");
          setHeading(data.heading || "");
          setSubheading(data.subheading || "");
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setImageUrl(data.url);
      setStatusMsg({ type: "success", text: "Image uploaded successfully!" });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setUploading(false);
    }
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
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (bannerId) {
        const { error } = await supabase.from("featured_banner").update(payload).eq("id", bannerId);
        if (error) throw error;
        setStatusMsg({ type: "success", text: "Featured banner updated successfully!" });
      } else {
        const { data, error } = await supabase.from("featured_banner").insert([payload]).select("id").single();
        if (error) throw error;
        if (data) setBannerId(data.id);
        setStatusMsg({ type: "success", text: "Featured banner published successfully!" });
      }
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-medium text-white tracking-wide">Featured Banner</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Configure a single large banner with a heading and subheading.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between border ${statusMsg.type === "success" ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300" : "bg-red-950/50 border-red-800/80 text-red-300"}`}>
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="text-neutral-400 hover:text-white text-xs ml-4">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Banner Image <span className="text-amber-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span>{uploading ? "Uploading..." : "Upload"}</span>
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
                placeholder="or paste image URL..."
                className="flex-1 w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
              />
            </div>
            {imageUrl && (
              <div className="mt-4 relative aspect-[21/9] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. New Collection"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">Subheading</label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. Discover our latest arrivals"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Featured Banner"}
          </button>
        </div>
      </form>
    </div>
  );
}
