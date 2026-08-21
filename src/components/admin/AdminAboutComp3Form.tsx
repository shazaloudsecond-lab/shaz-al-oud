"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteCloudinaryAsset } from "@/lib/cloudinaryClient";
import AdminUploadProgress from "@/components/admin/AdminUploadProgress";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export default function AdminAboutComp3Form() {
  const [configId, setConfigId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [bgColor, setBgColor] = useState("#D8CBB6");
  const [items, setItems] = useState<AccordionItem[]>([]);
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
          .from("about_section_three")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setConfigId(data.id);
          setImageUrl(data.image_url || "");
          setHeading(data.heading || "");
          setSubheading(data.subheading || "");
          setBgColor(data.bg_color || "#D8CBB6");
          setItems(Array.isArray(data.items) ? data.items : []);
          setIsActive(data.is_active ?? true);
        }
      } catch (err) {
        console.error("Error fetching about section 3:", err);
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

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `acc-${Date.now()}`,
        title: "",
        content: "",
      },
    ]);
  };

  const updateItem = (index: number, field: "title" | "content", value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;
    await deleteCloudinaryAsset(imageUrl);
    setImageUrl("");
    if (configId) {
      try {
        const supabase = createClient();
        await supabase
          .from("about_section_three")
          .update({ image_url: null, updated_at: new Date().toISOString() })
          .eq("id", configId);
      } catch (e) {
        console.error("Error deleting about 3 image in DB:", e);
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
        bg_color: bgColor.trim() || "#D8CBB6",
        items: items.filter((item) => item.title.trim() || item.content.trim()),
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (configId) {
        const { error } = await supabase
          .from("about_section_three")
          .update(payload)
          .eq("id", configId);
        if (error) throw error;
        setStatusMsg({ type: "success", text: "Component 3 (Accordion Section) updated successfully!" });
      } else {
        const { data, error } = await supabase
          .from("about_section_three")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        if (data) setConfigId(data.id);
        setStatusMsg({ type: "success", text: "Component 3 (Accordion Section) saved successfully!" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save Component 3." });
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
                Component 3 Visibility
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Layout: Left side Image, Right side Heading & Accordion
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

          {/* Left Side Image */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Left Side Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {imageUrl ? (
                <div className="relative w-full sm:w-48 aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                  <img src={imageUrl} alt="About 3 Preview" className="w-full h-full object-cover" />
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
                <div className="w-full sm:w-48 aspect-[4/3] rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xs flex-shrink-0">
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
                    placeholder="https://example.com/image3.jpg"
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* Upload Progress */}
                <AdminUploadProgress
                  progress={uploadProgress}
                  isUploading={uploading}
                  title="Uploading About Image"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Section Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 p-0 border border-neutral-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="#D8CBB6"
                className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 text-xs font-mono w-32 focus:outline-none focus:border-black"
              />
              <span className="text-xs text-neutral-400">Warm beige theme default (#D8CBB6)</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Main Heading (Right Side)
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Frequently Asked Questions & Heritage Secrets"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black text-sm font-medium"
            />
          </div>

          {/* Subheading */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Subheading / Tagline
            </label>
            <input
              type="text"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. Everything You Need to Know"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black text-sm font-medium"
            />
          </div>

          {/* Dynamic Accordion Items */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-neutral-800 font-bold font-mono">
                  Accordion Items ({items.length})
                </h4>
                <p className="text-xs text-neutral-500">
                  Add collapsible question & answer or craftsmanship breakdown items.
                </p>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
                No accordion items added yet. Click "+ Add Item" above to add your first question or detail item.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-neutral-500">
                        Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 text-xs font-mono cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(index, "title", e.target.value)}
                        placeholder="Accordion Item Title / Question (e.g. How are the ouds sourced?)"
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 text-xs font-medium focus:outline-none focus:border-black"
                      />

                      <textarea
                        rows={3}
                        value={item.content}
                        onChange={(e) => updateItem(index, "content", e.target.value)}
                        placeholder="Accordion Item Content / Answer description..."
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 text-xs focus:outline-none focus:border-black resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-neutral-200">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-8 py-3 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold tracking-wider uppercase text-xs rounded-lg transition-colors cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Component 3"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
