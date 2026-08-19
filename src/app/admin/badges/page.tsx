"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BadgeForm {
  id: string | null;
  position: number;
  iconUrl: string;
  heading: string;
  description: string;
  uploading: boolean;
}

const POSITIONS = [1, 2, 3, 4] as const;

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<BadgeForm[]>(
    POSITIONS.map((pos) => ({
      id: null,
      position: pos,
      iconUrl: "",
      heading: "",
      description: "",
      uploading: false,
    }))
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch existing badge data
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("badges")
          .select("*")
          .order("position", { ascending: true });

        if (error) {
          console.error("Error fetching badges:", error);
        }

        if (data && data.length > 0) {
          setBadges((prev) =>
            prev.map((badge) => {
              const row = data.find((d) => d.position === badge.position);
              if (row) {
                return {
                  ...badge,
                  id: row.id,
                  iconUrl: row.icon_url || "",
                  heading: row.heading || "",
                  description: row.description || "",
                };
              }
              return badge;
            })
          );
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const handleIconUpload = async (file: File, position: number) => {
    setBadges((prev) =>
      prev.map((b) => (b.position === position ? { ...b, uploading: true } : b))
    );
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setBadges((prev) =>
        prev.map((b) => (b.position === position ? { ...b, iconUrl: data.url, uploading: false } : b))
      );
      setStatusMsg({ type: "success", text: `Badge ${position} icon uploaded!` });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Upload failed." });
      setBadges((prev) =>
        prev.map((b) => (b.position === position ? { ...b, uploading: false } : b))
      );
    }
  };

  const updateField = (position: number, field: keyof BadgeForm, value: string) => {
    setBadges((prev) =>
      prev.map((b) => (b.position === position ? { ...b, [field]: value } : b))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const upserts = badges.map((b) => ({
        ...(b.id ? { id: b.id } : {}),
        position: b.position,
        icon_url: b.iconUrl.trim() || null,
        heading: b.heading.trim() || null,
        description: b.description.trim() || null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("badges")
        .upsert(upserts, { onConflict: "position" });

      if (error) throw error;
      setStatusMsg({ type: "success", text: "All badges saved successfully!" });
    } catch (err: any) {
      console.error("Save badges error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save badges." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-neutral-800 rounded" />
          <div className="h-4 w-72 bg-neutral-800/60 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {POSITIONS.map((p) => (
            <div key={p} className="h-72 bg-neutral-900 border border-neutral-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-medium text-white tracking-wide">Badges</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Configure 4 trust/feature badges shown on your homepage.
        </p>
      </div>

      {/* Status Message */}
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

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.position}
              className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-5"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
                    Badge {badge.position}
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">{badge.position}/4</span>
              </div>

              {/* Icon Upload */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Icon Image
                </label>

                {/* Preview + Upload Row */}
                <div className="flex items-center gap-4">
                  {/* Icon Preview */}
                  <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {badge.iconUrl ? (
                      <img src={badge.iconUrl} alt={`Badge ${badge.position} icon`} className="w-full h-full object-contain p-1" />
                    ) : (
                      <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2 w-fit">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{badge.uploading ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={badge.uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIconUpload(file, badge.position);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      value={badge.iconUrl}
                      onChange={(e) => updateField(badge.position, "iconUrl", e.target.value)}
                      placeholder="or paste image URL..."
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Heading
                </label>
                <input
                  type="text"
                  value={badge.heading}
                  onChange={(e) => updateField(badge.position, "heading", e.target.value)}
                  placeholder="e.g. Free Shipping"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Description
                </label>
                <textarea
                  value={badge.description}
                  onChange={(e) => updateField(badge.position, "description", e.target.value)}
                  placeholder="e.g. On all orders above ₹500"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
          >
            {saving ? "Saving..." : "Save All Badges"}
          </button>
        </div>
      </form>
    </div>
  );
}
