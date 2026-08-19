"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminContext, Category } from "@/context/AdminContext";

export default function AdminCategoriesPage() {
  const { categories, loadingCategories: loading, fetchCategories } = useAdminContext();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!selectedId) {
      setSlug(generateSlug(val));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setDisplayOrder(categories.length);
    setStatusMsg(null);
  };

  const startCreate = () => {
    resetForm();
    setIsEditing(true);
  };

  const startEdit = (cat: Category) => {
    setSelectedId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.image_url || "");
    setDisplayOrder(cat.display_order || 0);
    setIsEditing(true);
    setStatusMsg(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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

      setImageUrl(data.url);
      setStatusMsg({ type: "success", text: "Category image uploaded successfully!" });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMsg({ type: "error", text: "Category name is required." });
      return;
    }

    const finalSlug = slug.trim() || generateSlug(name);
    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const payload = {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        display_order: Number(displayOrder) || 0,
        updated_at: new Date().toISOString(),
      };

      if (selectedId) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", selectedId);
        if (error) throw error;
        setStatusMsg({ type: "success", text: "Category updated successfully!" });
      } else {
        // Insert new category
        const { error } = await supabase
          .from("categories")
          .insert([payload]);
        if (error) throw error;
        setStatusMsg({ type: "success", text: "Category created successfully!" });
      }

      await fetchCategories();
      setIsEditing(false);
      resetForm();
    } catch (err: any) {
      console.error("Save category error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save category." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"? Any products assigned to this category will have their category unassigned.`)) {
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;

      setStatusMsg({ type: "success", text: `Category "${catName}" deleted.` });
      if (selectedId === id) {
        resetForm();
      }
      await fetchCategories();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to delete category." });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-white tracking-wide">Category Management</h2>
          <p className="text-sm text-neutral-400">
            Create, edit, and organize product categories.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={startCreate}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Category
          </button>
        )}
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

      {/* Create / Edit Form Modal or Card */}
      {isEditing && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-semibold text-neutral-100">
                {selectedId ? "Edit Category" : "Add New Category"}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Fill in the details below. Categories help group and filter products on the store.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                  Category Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Women's, Unisex, Bath & Body"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                  URL Slug <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. womens, unisex, bath-and-body"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this fragrance category..."
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            {/* Display Order */}
            <div className="max-w-xs">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">Lower numbers appear first on the frontend tabs.</span>
            </div>

            {/* Category Image (Optional) */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                Category Image (Optional)
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

                <span className="text-xs text-neutral-500">or image URL:</span>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              {imageUrl && (
                <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                  <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-black text-neutral-300 hover:text-white rounded text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2"
              >
                {saving ? "Saving..." : selectedId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category List */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
              All Categories ({categories.length})
            </h3>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-neutral-800/60 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-neutral-800 rounded" />
                    <div className="h-3 w-48 bg-neutral-800/60 rounded" />
                  </div>
                </div>
                <div className="h-3 w-20 bg-neutral-800 rounded" />
                <div className="h-3 w-12 bg-neutral-800 rounded" />
                <div className="h-7 w-24 bg-neutral-800 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 space-y-3">
            <svg className="w-12 h-12 mx-auto text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-medium text-neutral-400">No categories found.</p>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Create your first category (e.g. Women&apos;s, Unisex, Bath &amp; Body) to organize your luxury fragrance products.
            </p>
            <button
              type="button"
              onClick={startCreate}
              className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              + Create Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/60 text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Category</th>
                  <th className="px-6 py-3.5 font-medium">Slug</th>
                  <th className="px-6 py-3.5 font-medium">Display Order</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-950 border border-neutral-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-500 font-bold text-sm">
                            {cat.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{cat.name}</p>
                          {cat.description && (
                            <p className="text-xs text-neutral-500 truncate max-w-xs">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                      /{cat.slug}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-400">
                      #{cat.display_order}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
