"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteCloudinaryAsset } from "@/lib/cloudinaryClient";
import AdminDeleteModal from "@/components/admin/AdminDeleteModal";
import AdminUploadProgress from "@/components/admin/AdminUploadProgress";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminNewsletterPage() {
  const [configId, setConfigId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete subscriber modal
  const [deleteSubModal, setDeleteSubModal] = useState<{ isOpen: boolean; id: string; email: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();

        // 1. Fetch Config
        const { data: configData, error: configError } = await supabase
          .from("newsletter_config")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!configError && configData) {
          setConfigId(configData.id);
          setImageUrl(configData.image_url || "");
          setHeading(configData.heading || "");
          setSubheading(configData.subheading || "");
        }

        // 2. Fetch Subscribers
        const { data: subscribersData, error: subError } = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .order("created_at", { ascending: false });

        if (!subError && subscribersData) {
          setSubscribers(subscribersData);
        }
      } catch (err) {
        console.error("Error fetching newsletter data:", err);
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

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const payload = {
        image_url: imageUrl.trim() || null,
        heading: heading.trim() || null,
        subheading: subheading.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (configId) {
        const { error } = await supabase
          .from("newsletter_config")
          .update(payload)
          .eq("id", configId);
        if (error) throw error;
        setStatusMsg({ type: "success", text: "Newsletter section updated successfully!" });
      } else {
        const { data, error } = await supabase
          .from("newsletter_config")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        if (data) setConfigId(data.id);
        setStatusMsg({ type: "success", text: "Newsletter section saved successfully!" });
      }
    } catch (err: any) {
      console.error("Save config error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save newsletter settings." });
    } finally {
      setSaving(false);
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
          .from("newsletter_config")
          .update({ image_url: null, updated_at: new Date().toISOString() })
          .eq("id", configId);
      } catch (e) {
        console.error("Error deleting newsletter image in DB:", e);
      }
    }
  };

  const handleConfirmDeleteSubscriber = async () => {
    if (!deleteSubModal) return;
    const { id } = deleteSubModal;
    setDeletingId(id);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setStatusMsg({ type: "success", text: "Subscriber removed successfully." });
      setDeleteSubModal(null);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to remove subscriber." });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-neutral-800 rounded" />
        <div className="h-96 bg-neutral-900 border border-neutral-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      <div>
        <h2 className="text-xl font-medium text-white tracking-wide">Newsletter Management</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Configure the newsletter section displayed on your storefront and manage subscribed emails.
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

      {/* Section Content Form */}
      <form onSubmit={handleSaveConfig} className="space-y-6">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-neutral-800 pb-3">
            Section Display Content
          </h3>

          {/* Section Image */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Section Image (Left Side)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploading ? "Uploading..." : "Upload Image"}</span>
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
              {imageUrl && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="px-3 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors flex-shrink-0"
                  title="Delete Image"
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
              title="Uploading Newsletter Image"
              className="mt-2 max-w-md"
            />
            {imageUrl && (
              <div className="mt-3 relative w-48 h-48 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                <img src={imageUrl} alt="Newsletter Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Subscribe to our newsletter"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            />
          </div>

          {/* Subheading */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">Subheading / Description</label>
            <textarea
              rows={3}
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. Receive exclusive promotions, new fragrance arrivals, and insider updates."
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-800">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Newsletter Settings"}
            </button>
          </div>
        </div>
      </form>

      {/* Subscribers List */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Subscriber Emails
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Total subscribers: <span className="font-semibold text-white">{subscribers.length}</span>
            </p>
          </div>
        </div>

        {subscribers.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500 bg-neutral-950 rounded-xl border border-neutral-800 border-dashed">
            No subscriber emails received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/70 uppercase tracking-wider text-neutral-400 font-mono text-[11px] border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Subscribed Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {subscribers.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-neutral-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 text-white font-medium">{sub.email}</td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono">
                      {new Date(sub.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteSubModal({ isOpen: true, id: sub.id, email: sub.email })}
                        className="px-2.5 py-1 text-red-400 hover:bg-red-950/70 hover:text-red-300 border border-red-900/40 rounded-lg transition-colors cursor-pointer text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Subscriber Confirmation Modal */}
      <AdminDeleteModal
        isOpen={!!deleteSubModal?.isOpen}
        onClose={() => setDeleteSubModal(null)}
        onConfirm={handleConfirmDeleteSubscriber}
        title="Remove Subscriber"
        message="Are you sure you want to remove this subscriber from your newsletter mailing list?"
        itemName={deleteSubModal?.email}
        loading={!!deletingId}
        confirmText="Remove Subscriber"
      />
    </div>
  );
}
