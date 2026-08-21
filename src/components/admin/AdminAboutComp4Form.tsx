"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteCloudinaryAsset } from "@/lib/cloudinaryClient";
import AdminUploadProgress from "@/components/admin/AdminUploadProgress";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

export default function AdminAboutComp4Form() {
  const [configId, setConfigId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("about_section_four")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setConfigId(data.id);
          setImageUrl(data.image_url || "");
          setHeading(data.heading || "");
          setSubheading(data.subheading || "");
          setDescription(data.description || "");
          setStory(data.story || "");
          setIsActive(data.is_active ?? true);
        }
      } catch (err) {
        console.error("Error fetching about section 4:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleDeleteImage = async () => {
    if (!imageUrl) return;
    await deleteCloudinaryAsset(imageUrl);
    setImageUrl("");
    if (configId) {
      try {
        const supabase = createClient();
        await supabase
          .from("about_section_four")
          .update({ image_url: null, updated_at: new Date().toISOString() })
          .eq("id", configId);
      } catch (e) {
        console.error("Error deleting about 4 image in DB:", e);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const payload = {
        image_url: imageUrl.trim() || null,
        heading: heading.trim() || null,
        subheading: subheading.trim() || null,
        description: description.trim() || null,
        story: story.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (configId) {
        const { error } = await supabase
          .from("about_section_four")
          .update(payload)
          .eq("id", configId);
        if (error) throw error;
        setStatusMsg({ type: "success", text: "Component 4 (Blended Banner) updated successfully!" });
      } else {
        const { data, error } = await supabase
          .from("about_section_four")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        if (data) setConfigId(data.id);
        setStatusMsg({ type: "success", text: "Component 4 (Blended Banner) saved successfully!" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save Component 4." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded" />
        <div className="h-48 bg-neutral-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            className="text-neutral-400 hover:text-white text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Status Toggle */}
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                Component 4 Visibility
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Layout: Top Blended Image, Bottom Left Heading & Right Paragraphs
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          {/* Top Background Image Upload */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Top Blended Background Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {imageUrl ? (
                <div className="relative w-full sm:w-60 aspect-[16/9] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-200 flex-shrink-0">
                  <img src={imageUrl} alt="Blended Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute top-2 right-2 bg-red-900/90 hover:bg-red-800 text-white p-1 rounded-full text-xs cursor-pointer shadow-md"
                    title="Delete Image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-full sm:w-60 aspect-[16/9] rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xs flex-shrink-0">
                  No Image Selected
                </div>
              )}

              <div className="flex-1 space-y-3 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                  }}
                  disabled={uploading}
                  className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">or URL:</span>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/craftsmanship.jpg"
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* Upload Progress */}
                <AdminUploadProgress
                  progress={uploadProgress}
                  isUploading={uploading}
                  title="Uploading Blended Background Image"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Bottom Left Heading */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Main Heading (Bottom Left)
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Quality & Craftsmanship"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black text-sm font-medium"
            />
          </div>

          {/* Subheading */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Subheading / Tagline (Optional)
            </label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. THE FOUNDATION OF EXCELLENCE"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black text-sm font-medium"
            />
          </div>

          {/* Bottom Right Description Paragraph 1 */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Paragraph 1 (Bottom Right)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quality is the foundation of everything we do. Every fragrance within our collection is chosen with care..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black text-sm font-medium resize-none leading-relaxed"
            />
          </div>

          {/* Bottom Right Story Paragraph 2 */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Paragraph 2 / Additional Story (Bottom Right)
            </label>
            <textarea
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Our approach combines traditional fragrance expertise with modern innovation, allowing us to create products..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black text-sm font-medium resize-none leading-relaxed"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-neutral-200">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-8 py-3 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold tracking-wider uppercase text-xs rounded-lg transition-colors cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Component 4"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
