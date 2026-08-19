"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminContext, HeroSlide, HeroConfig } from "@/context/AdminContext";

type LinkType = "shop" | "category" | "product" | "none";

const parseHeroLink = (link: string | null | undefined): { linkType: LinkType; selectedId: string } => {
  if (!link || link === "#" || link === "") {
    return { linkType: "none", selectedId: "" };
  }
  if (link === "/products" || link === "/shop") {
    return { linkType: "shop", selectedId: "" };
  }
  if (link.startsWith("/products/")) {
    const prodId = link.replace("/products/", "");
    return { linkType: "product", selectedId: prodId };
  }
  if (link.startsWith("/#categories") || link.startsWith("/categories/") || link.includes("category=")) {
    const catId = link.replace("/categories/", "").replace("/products?category=", "").replace("/#categories", "");
    return { linkType: "category", selectedId: catId };
  }
  return { linkType: "none", selectedId: "" };
};

const computeHeroLink = (type: LinkType, selectedId: string): string => {
  if (type === "shop") return "/products";
  if (type === "product") return selectedId ? `/products/${selectedId}` : "/products";
  if (type === "category") return selectedId ? `/products?category=${selectedId}` : "/#categories";
  return "#";
};

export default function AdminHeroPage() {
  const {
    heroSlides: slides,
    heroConfig,
    products,
    categories,
    loadingHeroSlides: loading,
    loadingHeroConfig,
    fetchHeroSlides: fetchSlides,
    fetchHeroConfig,
  } = useAdminContext();

  // ─── Media type state ─────────────────────────────────────────────
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // ─── Slide (image) state ──────────────────────────────────────────
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [mainHeading, setMainHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("/products");
  const [linkType, setLinkType] = useState<LinkType>("shop");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const hasInitialized = useRef(false);

  const updateLink = (type: LinkType, targetId: string) => {
    setLinkType(type);
    setSelectedTargetId(targetId);
    setButtonLink(computeHeroLink(type, targetId));
  };

  // ─── Sync heroConfig into local state ────────────────────────────
  useEffect(() => {
    if (heroConfig) {
      setMediaType(heroConfig.media_type);
      setVideoUrl(heroConfig.video_url || "");
    }
  }, [heroConfig]);

  // ─── Initialize form with first slide once on load ─────────────────
  useEffect(() => {
    if (slides && slides.length > 0 && !hasInitialized.current) {
      loadSlideIntoForm(slides[0]);
      hasInitialized.current = true;
    }
  }, [slides]);

  // ─── Helpers ──────────────────────────────────────────────────────
  const loadSlideIntoForm = (slide: HeroSlide) => {
    setSelectedSlideId(slide.id);
    setMainHeading(slide.main_heading || "");
    setSubHeading(slide.sub_heading || "");
    setBackgroundImage(slide.background_image || "");
    setButtonText(slide.button_text || "");
    const rawLink = slide.button_link || "/products";
    setButtonLink(rawLink);
    const parsed = parseHeroLink(rawLink);
    setLinkType(parsed.linkType);
    setSelectedTargetId(parsed.selectedId);
    setStatusMsg(null);
  };

  const resetForm = () => {
    setSelectedSlideId(null);
    setMainHeading("");
    setSubHeading("");
    setBackgroundImage("");
    setButtonText("");
    setButtonLink("/products");
    setLinkType("shop");
    setSelectedTargetId("");
    setStatusMsg(null);
  };

  // ─── Switch media type (saves to DB immediately) ──────────────────
  const handleMediaTypeSwitch = async (type: "image" | "video") => {
    if (type === mediaType) return;
    if (!heroConfig?.id) {
      setStatusMsg({ type: "error", text: "Hero config not loaded. Please refresh." });
      return;
    }

    setSavingConfig(true);
    setStatusMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("hero_config")
        .update({ media_type: type, updated_at: new Date().toISOString() })
        .eq("id", heroConfig.id);
      if (error) throw error;
      setMediaType(type);
      await fetchHeroConfig();
      setStatusMsg({ type: "success", text: `Switched to ${type === "video" ? "Video" : "Image Carousel"} mode.` });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to update media type." });
    } finally {
      setSavingConfig(false);
    }
  };

  // ─── Video upload ─────────────────────────────────────────────────
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setStatusMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-video", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setVideoUrl(data.url);
      setStatusMsg({ type: "success", text: "Video uploaded! Click 'Save Video' to apply." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload video." });
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  const handleSaveVideo = async () => {
    if (!heroConfig?.id) return;
    if (!videoUrl.trim()) {
      setStatusMsg({ type: "error", text: "Please upload or enter a video URL first." });
      return;
    }

    setSavingConfig(true);
    setStatusMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("hero_config")
        .update({ video_url: videoUrl, updated_at: new Date().toISOString() })
        .eq("id", heroConfig.id);
      if (error) throw error;
      await fetchHeroConfig();
      setStatusMsg({ type: "success", text: "Hero video saved successfully!" });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save video." });
    } finally {
      setSavingConfig(false);
    }
  };

  // ─── Image upload ─────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setBackgroundImage(data.url);
      setStatusMsg({ type: "success", text: "Background image uploaded successfully!" });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setUploading(false);
    }
  };

  // ─── Save slide ───────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainHeading.trim() || !backgroundImage.trim()) {
      setStatusMsg({ type: "error", text: "Main heading and background image are required." });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const payload = {
        main_heading: mainHeading,
        sub_heading: subHeading,
        background_image: backgroundImage,
        button_text: buttonText,
        button_link: buttonLink,
        updated_at: new Date().toISOString(),
      };

      if (selectedSlideId) {
        const { error } = await supabase.from("hero_section").update(payload).eq("id", selectedSlideId);
        if (error) throw error;
        await fetchSlides();
        loadSlideIntoForm({ ...payload, id: selectedSlideId } as HeroSlide);
        setStatusMsg({ type: "success", text: "Hero slide updated successfully!" });
      } else {
        const { data, error } = await supabase.from("hero_section").insert([payload]).select("id").single();
        if (error) throw error;
        await fetchSlides();
        setSelectedSlideId(data?.id);
        setStatusMsg({ type: "success", text: "New hero slide added to carousel!" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save slide." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete slide ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedSlideId) return;
    if (!confirm("Are you sure you want to delete this carousel slide?")) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("hero_section").delete().eq("id", selectedSlideId);
      if (error) throw error;
      setStatusMsg({ type: "success", text: "Slide deleted." });
      resetForm();
      await fetchSlides();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to delete slide." });
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────
  if (loading || loadingHeroConfig) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-neutral-800 rounded" />
            <div className="h-4 w-72 bg-neutral-800/60 rounded" />
          </div>
          <div className="h-9 w-32 bg-neutral-800 rounded-lg" />
        </div>
        <div className="h-12 w-full bg-neutral-900 rounded-2xl border border-neutral-800" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-neutral-800 rounded-xl" />
          <div className="h-8 w-24 bg-neutral-800 rounded-xl" />
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6">
          <div className="h-10 bg-neutral-950 rounded-xl border border-neutral-800" />
          <div className="h-10 bg-neutral-950 rounded-xl border border-neutral-800" />
          <div className="h-36 bg-neutral-950 rounded-xl border border-neutral-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-white tracking-wide">Hero Section Management</h2>
          <p className="text-sm text-neutral-400">
            Choose a media type and manage the hero background.
          </p>
        </div>
        {mediaType === "image" && (
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Slide
          </button>
        )}
      </div>

      {/* ── Media Type Toggle ── */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5">
        <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-3">
          Hero Background Type
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={savingConfig}
            onClick={() => handleMediaTypeSwitch("image")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-2 ${
              mediaType === "image"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Image Carousel
          </button>

          <button
            type="button"
            disabled={savingConfig}
            onClick={() => handleMediaTypeSwitch("video")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-2 ${
              mediaType === "video"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Video
          </button>

          {savingConfig && (
            <span className="text-xs text-neutral-500 animate-pulse">Saving…</span>
          )}
        </div>
      </div>

      {/* ── Status Alert ── */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
              : "bg-red-950/50 border-red-800/80 text-red-300"
          }`}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ══════════════ VIDEO MODE ══════════════ */}
      {mediaType === "video" && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
              Hero Video
            </h3>
            <span className="text-xs text-neutral-500">One video displayed fullscreen as background</span>
          </div>

          {/* Upload area */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Background Video
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploadingVideo ? "Uploading…" : "Upload Video"}</span>
                <input
                  type="file"
                  accept="video/*"
                  disabled={uploadingVideo}
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-neutral-500">or enter a video URL directly:</span>

              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/…/video/upload/…"
                className="flex-1 w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            {/* Video preview */}
            {videoUrl && (
              <div className="mt-4 relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-video max-h-64">
                <video
                  src={videoUrl}
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-neutral-300 hover:text-white rounded-md text-xs cursor-pointer"
                >
                  Clear Video
                </button>
              </div>
            )}
          </div>

          {/* Save video button */}
          <div className="flex justify-end pt-2 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={handleSaveVideo}
              disabled={savingConfig || uploadingVideo}
              className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-semibold tracking-wider uppercase text-xs rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-amber-950/40"
            >
              {savingConfig ? "Saving…" : "Save Video"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ IMAGE CAROUSEL MODE ══════════════ */}
      {mediaType === "image" && (
        <>
          {/* Slide Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 pb-2">
            {slides.map((slide, index) => {
              const isSelected = slide.id === selectedSlideId;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => loadSlideIntoForm(slide)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-amber-400" : "bg-neutral-600"}`} />
                  Slide {index + 1}
                </button>
              );
            })}

            <button
              type="button"
              onClick={resetForm}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                selectedSlideId === null
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                  : "bg-neutral-900 text-neutral-400 border-dashed border-neutral-700 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedSlideId === null ? "bg-amber-400" : "bg-neutral-600"}`} />
              + Add New Slide
            </button>
          </div>

          {/* Slide Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
                  {selectedSlideId ? `Editing Slide` : `Create New Slide`}
                </h3>
                {selectedSlideId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-medium cursor-pointer"
                  >
                    Delete This Slide
                  </button>
                )}
              </div>

              {/* Main Heading */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                  Main Heading <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mainHeading}
                  onChange={(e) => setMainHeading(e.target.value)}
                  placeholder="Enter main hero heading..."
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              {/* Subheading */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                  Subheading
                </label>
                <input
                  type="text"
                  value={subHeading}
                  onChange={(e) => setSubHeading(e.target.value)}
                  placeholder="Optional secondary text or description"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              {/* Background Image */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Background Image <span className="text-amber-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{uploading ? "Uploading..." : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-neutral-500">or enter image URL directly:</span>

                  <input
                    type="url"
                    value={backgroundImage}
                    onChange={(e) => setBackgroundImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  />
                </div>

                {backgroundImage && (
                  <div className="mt-4 relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-[21/9] max-h-56">
                    <img
                      src={backgroundImage}
                      alt="Hero Slide Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBackgroundImage("")}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-neutral-300 hover:text-white rounded-md text-xs cursor-pointer"
                    >
                      Clear Image
                    </button>
                  </div>
                )}
              </div>

              {/* Button Settings & Destination Selector */}
              <div className="space-y-5 pt-4 border-t border-neutral-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Explore Now"
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2 font-medium">
                      Active Button Link (Auto-Generated)
                    </label>
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={buttonLink}
                      className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-500 text-sm font-mono cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>

                {/* Link Type Destination Selector Tabs */}
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                    Button Link Action / Destination
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-neutral-100 border border-neutral-300">
                    {[
                      { type: "shop" as LinkType, label: "Shop" },
                      { type: "category" as LinkType, label: "Category Select" },
                      { type: "product" as LinkType, label: "Product Select" },
                      { type: "none" as LinkType, label: "No Link" },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          let newTargetId = selectedTargetId;
                          if (item.type === "product" && !newTargetId && products && products.length > 0) {
                            newTargetId = products[0].id;
                          } else if (item.type === "category" && !newTargetId && categories && categories.length > 0) {
                            newTargetId = categories[0].slug || categories[0].id;
                          }
                          updateLink(item.type, newTargetId);
                        }}
                        className={`py-2.5 px-3 text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center text-center ${
                          linkType === item.type
                            ? "admin-tab-btn-active bg-black text-white font-bold"
                            : "admin-tab-btn-inactive bg-transparent text-neutral-700 hover:bg-white hover:text-black font-semibold"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Category Dropdown UI */}
                  {linkType === "category" && (
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 animate-fadeIn">
                      <label className="block text-xs font-semibold text-neutral-900">
                        Choose Destination Category:
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTargetId}
                          onChange={(e) => updateLink("category", e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-sm font-medium focus:outline-none focus:border-black cursor-pointer appearance-none shadow-xs pr-10"
                        >
                          <option value="">-- All Categories (/#categories) --</option>
                          {categories && categories.map((cat) => (
                            <option key={cat.id} value={cat.slug || cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Dropdown UI */}
                  {linkType === "product" && (
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 animate-fadeIn">
                      <label className="block text-xs font-semibold text-neutral-900">
                        Choose Destination Product:
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTargetId}
                          onChange={(e) => updateLink("product", e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-sm font-medium focus:outline-none focus:border-black cursor-pointer appearance-none shadow-xs pr-10"
                        >
                          <option value="">-- Select a Fragrance / Product --</option>
                          {products && products.map((p) => {
                            const label = p.our_signature && p.name && p.name !== p.our_signature
                              ? `${p.our_signature} (${p.name})`
                              : p.our_signature || p.name;
                            return (
                              <option key={p.id} value={p.id}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-semibold tracking-wider uppercase text-xs rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-amber-950/40 flex items-center gap-2"
              >
                {saving ? "Saving Slide..." : selectedSlideId ? "Update Slide" : "Add Slide to Carousel"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
