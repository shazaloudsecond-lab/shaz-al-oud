"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminContext, Product, ProductVariant, ProductVariantPrice, Country } from "@/context/AdminContext";
import { deleteCloudinaryAsset } from "@/lib/cloudinaryClient";
import AdminDeleteModal from "@/components/admin/AdminDeleteModal";
import AdminUploadProgress from "@/components/admin/AdminUploadProgress";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

interface CountryPriceFormItem {
  price: string;
  original_price: string;
  is_in_stock?: boolean;
}

interface VariantFormItem {
  volume: string;
  is_in_stock: boolean;
  prices: {
    [countryCode: string]: CountryPriceFormItem;
  };
  price: string;
  original_price: string;
}

const DEFAULT_VOLUMES = ["30ml", "50ml", "100ml"];

function createEmptyVariant(volume: string, countries: Country[]): VariantFormItem {
  const initialPrices: { [countryCode: string]: CountryPriceFormItem } = {};
  countries.forEach((c) => {
    initialPrices[c.code] = { price: "", original_price: "", is_in_stock: true };
  });

  return {
    volume,
    is_in_stock: true,
    prices: initialPrices,
    price: "",
    original_price: "",
  };
}

export default function AdminProductsPage() {
  const {
    products,
    categories,
    countries,
    loadingProducts: loading,
    fetchProducts: fetchData,
  } = useAdminContext();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // View Details Modal State
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [ourSignature, setOurSignature] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [variants, setVariants] = useState<VariantFormItem[]>([]);
  const [selectedVariantTab, setSelectedVariantTab] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isInStock, setIsInStock] = useState(true);

  // Active countries for pricing
  const activeCountries = countries.filter((c) => c.is_active);
  const displayCountries = activeCountries.length > 0 ? activeCountries : countries;

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSignatureChange = (val: string) => {
    setOurSignature(val);
    if (!selectedId) {
      setSlug(generateSlug(val));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedId(null);
    setBrandName("");
    setOurSignature("");
    setNameAr("");
    setSlug("");
    setCategoryId("");
    setVariants(DEFAULT_VOLUMES.map((vol) => createEmptyVariant(vol, displayCountries)));
    setSelectedVariantTab(0);
    setDescription("");
    setImageUrls([]);
    setMainImage("");
    setIsFeatured(false);
    setIsInStock(true);
    setStatusMsg(null);
  };

  const startCreate = () => {
    resetForm();
    setIsEditing(true);
  };

  const startEdit = (product: Product) => {
    setSelectedId(product.id);
    setBrandName(product.brand_name || "");
    setOurSignature(product.our_signature || product.name || "");
    setNameAr(product.name_ar || "");
    setSlug(product.slug || generateSlug(product.our_signature || product.name));
    setCategoryId(product.category_id || "");

    // Load variants with per-country prices
    let loadedVariants: VariantFormItem[] = [];

    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      loadedVariants = product.variants.map((v: ProductVariant) => {
        const prices: { [countryCode: string]: CountryPriceFormItem } = {};

        displayCountries.forEach((c) => {
          if (v.prices && v.prices[c.code]) {
            prices[c.code] = {
              price: v.prices[c.code].price != null ? v.prices[c.code].price.toString() : "",
              original_price:
                v.prices[c.code].original_price != null ? v.prices[c.code].original_price!.toString() : "",
              is_in_stock: v.prices[c.code].is_in_stock !== false,
            };
          } else {
            // Fallback to base variant price if country price not explicitly set
            prices[c.code] = {
              price: v.price != null ? v.price.toString() : "",
              original_price: v.original_price != null ? v.original_price.toString() : "",
              is_in_stock: v.is_in_stock !== false,
            };
          }
        });

        return {
          volume: v.volume || "30ml",
          is_in_stock: v.is_in_stock !== false,
          prices,
          price: v.price != null ? v.price.toString() : "",
          original_price: v.original_price != null ? v.original_price.toString() : "",
        };
      });
    } else if (product.volume || product.price) {
      const prices: { [countryCode: string]: CountryPriceFormItem } = {};
      displayCountries.forEach((c) => {
        prices[c.code] = {
          price: product.price ? product.price.toString() : "",
          original_price: product.original_price ? product.original_price.toString() : "",
          is_in_stock: product.is_in_stock !== false,
        };
      });

      loadedVariants = [
        {
          volume: product.volume || "30ml",
          is_in_stock: product.is_in_stock !== false,
          prices,
          price: product.price ? product.price.toString() : "",
          original_price: product.original_price ? product.original_price.toString() : "",
        },
      ];
    } else {
      loadedVariants = DEFAULT_VOLUMES.map((vol) => createEmptyVariant(vol, displayCountries));
    }

    setVariants(loadedVariants);
    setSelectedVariantTab(0);
    setDescription(product.description || "");
    const existingImages =
      product.images && product.images.length > 0
        ? product.images
        : product.image_url
        ? [product.image_url]
        : [];
    setImageUrls(existingImages);
    setMainImage(product.image_url || existingImages[0] || "");
    setIsFeatured(!!product.is_featured);
    setIsInStock(product.is_in_stock !== false);
    setIsEditing(true);
    setStatusMsg(null);
  };

  // Toggle All Variants In Stock
  const handleToggleAllStock = (checked: boolean) => {
    setIsInStock(checked);
    setVariants((prev) => prev.map((v) => ({ ...v, is_in_stock: checked })));
  };

  // Variant operations
  const handleAddVariant = (volumeName: string = "Custom") => {
    const newVariant = createEmptyVariant(volumeName, displayCountries);
    setVariants((prev) => [...prev, newVariant]);
    setSelectedVariantTab(variants.length);
  };

  const handleUpdateVariantField = (
    index: number,
    field: "volume" | "price" | "original_price" | "is_in_stock",
    value: any
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      if (field === "is_in_stock") {
        const isStockChecked = Boolean(value);
        // Synchronize all country pricing stock under this volume variant
        const currentPrices = { ...(updated[index].prices || {}) };
        displayCountries.forEach((c) => {
          currentPrices[c.code] = {
            ...(currentPrices[c.code] || { price: "", original_price: "", is_in_stock: true }),
            is_in_stock: isStockChecked,
          };
        });
        updated[index] = {
          ...updated[index],
          is_in_stock: isStockChecked,
          prices: currentPrices,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleUpdateCountryPrice = (
    variantIndex: number,
    countryCode: string,
    field: "price" | "original_price" | "is_in_stock",
    value: string | boolean
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      const currentPrices = { ...(updated[variantIndex].prices || {}) };
      currentPrices[countryCode] = {
        ...(currentPrices[countryCode] || { price: "", original_price: "", is_in_stock: true }),
        [field]: value,
      };

      // Also sync base price if this is default country (or first country)
      const defaultCountry = displayCountries.find((c) => c.is_default) || displayCountries[0];
      const isDef = defaultCountry && defaultCountry.code === countryCode;

      // When updating individual country stock, check if any country is in stock
      let variantInStock = updated[variantIndex].is_in_stock;
      if (field === "is_in_stock") {
        const anyCountryInStock = Object.values(currentPrices).some(
          (p) => p.is_in_stock !== false
        );
        variantInStock = anyCountryInStock;
      }

      updated[variantIndex] = {
        ...updated[variantIndex],
        prices: currentPrices,
        is_in_stock: variantInStock,
        price: isDef && field === "price" ? (value as string) : updated[variantIndex].price || (typeof value === "string" ? value : ""),
        original_price:
          isDef && field === "original_price" ? (value as string) : updated[variantIndex].original_price || (typeof value === "string" ? value : ""),
      };

      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      setStatusMsg({ type: "error", text: "Product must have at least one volume option." });
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setSelectedVariantTab((prev) => Math.max(0, prev - 1));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setImageUrls((prev) => {
          const next = [...prev, data.url as string];
          if (!mainImage) setMainImage(data.url as string);
          return next;
        });
        setStatusMsg({ type: "success", text: "Image uploaded successfully!" });
      } else {
        throw new Error(data.error || "Upload failed.");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (url: string) => {
    await deleteCloudinaryAsset(url);
    const updated = imageUrls.filter((u) => u !== url);
    const nextMain = mainImage === url ? (updated[0] || "") : mainImage;
    setImageUrls(updated);
    if (mainImage === url) {
      setMainImage(nextMain);
    }

    // If editing existing product, immediately persist image removal to database
    if (selectedId) {
      try {
        const supabase = createClient();
        await supabase
          .from("products")
          .update({
            image_url: nextMain,
            images: updated,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedId);
      } catch (e) {
        console.error("Error syncing image removal to DB:", e);
      }
    }
  };

  const handleAddImageUrl = (url: string) => {
    if (!url.trim()) return;
    setImageUrls((prev) => {
      if (prev.includes(url.trim())) return prev;
      const updated = [...prev, url.trim()];
      if (updated.length === 1) setMainImage(url.trim());
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = ourSignature.trim();
    if (!finalName) {
      setStatusMsg({ type: "error", text: "Brand Name / Our Signature is required." });
      return;
    }

    if (variants.length === 0) {
      setStatusMsg({ type: "error", text: "Please add at least one volume variant (30ml, 50ml, 100ml)." });
      return;
    }

    // Process and validate variants
    const defaultCountry = displayCountries.find((c) => c.is_default) || displayCountries[0];
    const defCode = defaultCountry ? defaultCountry.code : "QA";

    const validatedVariants: ProductVariant[] = [];

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.volume?.trim()) continue;

      const structuredPrices: { [code: string]: ProductVariantPrice } = {};

      // Check if at least one country price is filled
      let hasAnyPrice = false;

      displayCountries.forEach((c) => {
        const cp = v.prices?.[c.code];
        if (cp && cp.price && cp.price.trim() !== "") {
          const pNum = parseFloat(cp.price);
          if (!isNaN(pNum) && pNum > 0) {
            hasAnyPrice = true;
            const origNum =
              cp.original_price && !isNaN(parseFloat(cp.original_price))
                ? parseFloat(cp.original_price)
                : null;
            structuredPrices[c.code] = {
              price: pNum,
              original_price: origNum,
              is_in_stock: cp.is_in_stock !== false,
            };
          }
        }
      });

      // If no specific country price entered, fallback to variant base price if provided
      if (!hasAnyPrice && v.price && v.price.trim() !== "") {
        const baseNum = parseFloat(v.price);
        if (!isNaN(baseNum) && baseNum > 0) {
          hasAnyPrice = true;
          displayCountries.forEach((c) => {
            structuredPrices[c.code] = {
              price: baseNum,
              original_price: v.original_price ? parseFloat(v.original_price) : null,
              is_in_stock: v.is_in_stock !== false,
            };
          });
        }
      }

      // If this variant has no price entered at all, skip it (variants are optional)
      if (!hasAnyPrice) {
        continue;
      }

      // Default country price for backwards compatibility
      const defPriceObj = structuredPrices[defCode] || Object.values(structuredPrices)[0];
      const baseSellingPrice = defPriceObj ? defPriceObj.price : 0;
      const baseOriginalPrice = defPriceObj?.original_price || null;

      validatedVariants.push({
        volume: v.volume.trim(),
        price: baseSellingPrice,
        original_price: baseOriginalPrice,
        is_in_stock: v.is_in_stock,
        prices: structuredPrices,
      });
    }

    if (validatedVariants.length === 0) {
      setStatusMsg({ type: "error", text: "Please enter a selling price for at least one volume variant (e.g. 30ml, 50ml, or 100ml)." });
      return;
    }

    if (!mainImage.trim()) {
      setStatusMsg({ type: "error", text: "At least one product image is required." });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    const primaryVariant = validatedVariants[0];

    try {
      const supabase = createClient();
      const payload: any = {
        name: finalName,
        name_ar: nameAr.trim() || null,
        brand_name: brandName.trim() || null,
        our_signature: ourSignature.trim() || null,
        slug: slug.trim() || generateSlug(finalName),
        category_id: categoryId ? categoryId : null,
        price: primaryVariant.price,
        original_price: primaryVariant.original_price || null,
        volume: primaryVariant.volume,
        variants: validatedVariants,
        description: description.trim() || null,
        image_url: mainImage.trim(),
        images: imageUrls,
        is_featured: isFeatured,
        is_in_stock: validatedVariants.some((v) => v.is_in_stock !== false),
        updated_at: new Date().toISOString(),
      };

      if (selectedId) {
        let { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", selectedId);

        if (error && error.message?.includes("name_ar")) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.name_ar;
          const retryRes = await supabase.from("products").update(fallbackPayload).eq("id", selectedId);
          error = retryRes.error;
        }

        if (error) throw error;
        setStatusMsg({ type: "success", text: "Product updated successfully!" });
      } else {
        let { error } = await supabase
          .from("products")
          .insert([payload]);

        if (error && error.message?.includes("name_ar")) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.name_ar;
          const retryRes = await supabase.from("products").insert([fallbackPayload]);
          error = retryRes.error;
        }

        if (error) throw error;
        setStatusMsg({ type: "success", text: "Product created successfully!" });
      }

      await fetchData();
      setIsEditing(false);
      resetForm();
    } catch (err: any) {
      console.error("Save product error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save product." });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    const { id, name: prodName } = deleteModal;

    setDeleting(true);
    setStatusMsg(null);

    try {
      const targetProd = products.find((p) => p.id === id);
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      if (targetProd) {
        const imagesToDelete = [targetProd.image_url, ...(targetProd.images || [])].filter(Boolean);
        await deleteCloudinaryAsset(imagesToDelete);
      }

      setStatusMsg({ type: "success", text: `Product "${prodName}" deleted successfully.` });
      if (selectedId === id) {
        resetForm();
      }
      setDeleteModal(null);
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to delete product." });
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.our_signature && p.our_signature.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === "all" || p.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-light text-white tracking-wide flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-400/10 text-amber-400 rounded-lg border border-amber-400/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            Products &amp; Pricing
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage fragrance inventory with 30ml, 50ml, and 100ml multi-country pricing.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={startCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </button>
        )}
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              : "bg-red-950/40 text-red-300 border-red-800/60"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {isEditing && (
        <div className="bg-neutral-950 p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-serif text-white">
                {selectedId ? "Edit Fragrance Product" : "Create New Fragrance Product"}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Configure Brand Name, Our Signature, and volume pricing per country.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-neutral-400 hover:text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Brand Name <span className="text-neutral-500 lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Shaz Al Oud"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm font-medium"
                />
              </div>

              {/* Our Signature / Product Name */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Our Signature / Fragrance Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ourSignature}
                  onChange={(e) => handleSignatureChange(e.target.value)}
                  placeholder="e.g. Royal Amber Oud, Shaz Mix"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm font-medium"
                />
              </div>

              {/* Arabic Product Name */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium flex items-center justify-between">
                  <span>Arabic Name / اسم المنتج</span>
                  <span className="text-neutral-500 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: لافندر أرجواني، عود ملكي"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slug */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  URL Slug <span className="text-neutral-500 lowercase">(auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. royal-amber-oud"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm font-mono"
                />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* MULTI-COUNTRY VOLUME PRICING SECTION (30ml, 50ml, 100ml) */}
            {/* ========================================================================= */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Country-Specific Volume Pricing
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Configure separate Original Price and Selling Price for each country dynamically from Country Management.
                  </p>
                </div>

                {/* Preset Volume Quick-Add */}
                <div className="flex items-center gap-1.5">
                  {DEFAULT_VOLUMES.map((vol) => {
                    const exists = variants.some((v) => v.volume.toLowerCase() === vol.toLowerCase());
                    return (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => {
                          if (!exists) handleAddVariant(vol);
                        }}
                        disabled={exists}
                        className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                          exists
                            ? "bg-neutral-950 text-neutral-600 border-neutral-800 cursor-default"
                            : "bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-neutral-700 cursor-pointer"
                        }`}
                      >
                        {exists ? `✓ ${vol}` : `+ ${vol}`}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleAddVariant("Custom")}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    + Custom
                  </button>
                </div>
              </div>

              {/* Variant Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-300">
                {variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariantTab(idx)}
                    className={`px-4 py-2.5 text-xs font-mono transition-all border cursor-pointer flex items-center gap-2 ${
                      selectedVariantTab === idx
                        ? "bg-black text-white font-bold border-black shadow-sm"
                        : "bg-neutral-100 text-neutral-600 font-semibold border-neutral-300 hover:bg-neutral-200 hover:text-black"
                    }`}
                  >
                    <span className={selectedVariantTab === idx ? "text-white font-bold" : "text-neutral-700 font-semibold"}>
                      {v.volume || `Volume ${idx + 1}`}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        v.is_in_stock ? "bg-emerald-400" : "bg-neutral-400"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Active Variant Country Pricing Matrix */}
              {variants[selectedVariantTab] && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Variant Header Settings */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                        Variant Volume:
                      </label>
                      <input
                        type="text"
                        required
                        value={variants[selectedVariantTab].volume}
                        onChange={(e) =>
                          handleUpdateVariantField(selectedVariantTab, "volume", e.target.value)
                        }
                        placeholder="e.g. 30ml, 50ml, 100ml"
                        className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variants[selectedVariantTab].is_in_stock}
                          onChange={(e) =>
                            handleUpdateVariantField(
                              selectedVariantTab,
                              "is_in_stock",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 rounded text-amber-600 bg-neutral-900 border-neutral-700 focus:ring-amber-500"
                        />
                        <span
                          className={`text-xs font-medium ${
                            variants[selectedVariantTab].is_in_stock
                              ? "text-emerald-400"
                              : "text-neutral-500"
                          }`}
                        >
                          {variants[selectedVariantTab].is_in_stock ? "In Stock" : "Out of Stock"}
                        </span>
                      </label>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(selectedVariantTab)}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Remove Volume
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Per-Country Pricing Inputs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                        Country Pricing ({variants[selectedVariantTab].volume})
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        Configured dynamically from Country Management
                      </span>
                    </div>

                    {displayCountries.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40 text-neutral-500 text-xs">
                        No active countries configured. Please add countries in Country Management.
                      </div>
                    ) : (
                      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto scrollbar-hide">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-900/90 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                              <tr>
                                <th className="py-2.5 px-3.5">Country</th>
                                <th className="py-2.5 px-3.5">Currency</th>
                                <th className="py-2.5 px-3.5 w-40">Selling Price</th>
                                <th className="py-2.5 px-3.5 w-40">Original Price <span className="text-neutral-500 text-[9px] lowercase font-normal">(optional)</span></th>
                                <th className="py-2.5 px-3.5 text-center w-28">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-900">
                              {displayCountries.map((c) => {
                                const countryPrices =
                                  variants[selectedVariantTab]?.prices?.[c.code] || {
                                    price: "",
                                    original_price: "",
                                    is_in_stock: true,
                                  };

                                return (
                                  <tr key={c.code} className="hover:bg-neutral-900/30 transition-colors">
                                    <td className="py-2.5 px-3.5">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-[10px] text-amber-400 flex-shrink-0">
                                          {c.code}
                                        </span>
                                        <span className="font-medium text-white text-xs">{c.name}</span>
                                        {c.is_default && (
                                          <span className="text-[9px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-semibold">
                                            Default
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3.5 font-mono text-xs text-neutral-300">
                                      <span className="text-amber-400 font-semibold">{c.currency_code}</span>
                                      <span className="text-neutral-500 text-[11px] ml-1.5">{c.currency_symbol}</span>
                                    </td>
                                    <td className="py-2 px-3.5">
                                      <div className="relative flex items-center">
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={countryPrices.price}
                                          onChange={(e) =>
                                            handleUpdateCountryPrice(
                                              selectedVariantTab,
                                              c.code,
                                              "price",
                                              e.target.value
                                            )
                                          }
                                          placeholder="0.00"
                                          className="w-full pl-3 pr-12 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-neutral-600"
                                        />
                                        <span className="absolute right-2.5 text-[10px] font-mono text-neutral-500 pointer-events-none">
                                          {c.currency_code}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3.5">
                                      <div className="relative flex items-center">
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={countryPrices.original_price}
                                          onChange={(e) =>
                                            handleUpdateCountryPrice(
                                              selectedVariantTab,
                                              c.code,
                                              "original_price",
                                              e.target.value
                                            )
                                          }
                                          placeholder="0.00"
                                          className="w-full pl-3 pr-12 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-neutral-600"
                                        />
                                        <span className="absolute right-2.5 text-[10px] font-mono text-neutral-500 pointer-events-none">
                                          {c.currency_code}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3.5 text-center">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={countryPrices.is_in_stock !== false}
                                          onChange={(e) =>
                                            handleUpdateCountryPrice(
                                              selectedVariantTab,
                                              c.code,
                                              "is_in_stock",
                                              e.target.checked
                                            )
                                          }
                                          className="w-3.5 h-3.5 rounded text-amber-500 bg-neutral-900 border-neutral-700 focus:ring-amber-500 cursor-pointer"
                                        />
                                        <span
                                          className={`text-[10px] font-medium ${
                                            countryPrices.is_in_stock !== false
                                              ? "text-emerald-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          {countryPrices.is_in_stock !== false ? "In Stock" : "Out of Stock"}
                                        </span>
                                      </label>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-2 font-medium">
                Fragrance Notes &amp; Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the fragrance notes, character, and details..."
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            {/* Product Images */}
            <div className="space-y-4 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
                  Product Images <span className="text-amber-500">*</span>
                </label>
                <span className="text-[11px] text-neutral-500">Click a thumbnail to set it as the Main Image</span>
              </div>

              {/* Upload Button & URL */}
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-neutral-700 flex items-center gap-2 flex-shrink-0">
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

                <div className="flex flex-1 items-center gap-2 w-full">
                  <input
                    id="manual-image-url"
                    type="url"
                    placeholder="or paste image URL and press Enter"
                    className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        handleAddImageUrl(input.value);
                        input.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("manual-image-url") as HTMLInputElement;
                      if (input) {
                        handleAddImageUrl(input.value);
                        input.value = "";
                      }
                    }}
                    className="px-3 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-600 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Upload Progress Animation */}
              <AdminUploadProgress
                progress={uploadProgress}
                isUploading={uploading}
                title="Uploading Product Image"
                className="mt-2"
              />

              {/* Gallery */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                  {imageUrls.map((url, idx) => {
                    const isMain = url === mainImage;
                    return (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isMain
                            ? "border-amber-500 shadow-lg shadow-amber-900/30"
                            : "border-neutral-700 hover:border-amber-500/50"
                        }`}
                      >
                        <div
                          className="w-full aspect-square bg-[#fbf9f6] flex items-center justify-center p-1"
                          onClick={() => setMainImage(url)}
                        >
                          <img src={url} alt={`Product view ${idx + 1}`} className="w-full h-full object-contain" />
                        </div>

                        {isMain && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                            Main
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(url);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/80 hover:bg-red-600 text-white rounded flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ✕
                        </button>

                        {!isMain && (
                          <button
                            type="button"
                            onClick={() => setMainImage(url)}
                            className="absolute bottom-0 left-0 right-0 bg-black/70 text-amber-400 text-[9px] font-semibold uppercase tracking-wider py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Set Main
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Featured Option */}
            <div className="flex items-center gap-6 pt-4 border-t border-neutral-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 bg-neutral-950 border-neutral-700 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Featured Product
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-lg cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving..." : selectedId ? "Update Fragrance" : "Create Fragrance"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCTS INVENTORY LIST */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by brand name, signature, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-3xl bg-neutral-950/40">
            <p className="text-neutral-400 text-sm">No products found.</p>
            <button
              onClick={startCreate}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-xl transition-colors cursor-pointer"
            >
              Add New Product
            </button>
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-900/90 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Brand Name</th>
                    <th className="py-3 px-4">Our Signature / Product</th>
                    <th className="py-3 px-4">Variants</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredProducts.map((p) => {
                    const productVariants: ProductVariant[] =
                      p.variants && Array.isArray(p.variants) && p.variants.length > 0
                        ? p.variants
                        : [
                            {
                              volume: p.volume || "30ml",
                              price: p.price,
                              original_price: p.original_price,
                              is_in_stock: p.is_in_stock !== false,
                            },
                          ];

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                        {/* Brand Name */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-neutral-900">
                            {p.brand_name || "Shaz Al Oud"}
                          </span>
                        </td>

                        {/* Our Signature / Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0">
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900 text-xs">
                                {p.our_signature || p.name}
                              </p>
                              {p.our_signature && p.name !== p.our_signature && (
                                <p className="text-[10px] text-neutral-500 mt-0.5">{p.name}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Variants Available */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {productVariants.map((v, vIdx) => (
                              <span
                                key={vIdx}
                                className={`text-[11px] font-mono font-bold px-2 py-0.5 border ${
                                  v.is_in_stock !== false
                                    ? "bg-neutral-100 border-neutral-300 text-neutral-900"
                                    : "bg-red-50 border-red-200 text-red-600 line-through"
                                }`}
                              >
                                {v.volume}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3">
                          {p.is_in_stock ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingProduct(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 rounded-lg transition-colors cursor-pointer"
                              title="View Full Product Details"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(p)}
                              className="px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ isOpen: true, id: p.id, name: p.name })}
                              className="px-2.5 py-1 text-[11px] font-medium text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 rounded-lg transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRODUCT DETAILS MODAL */}
      {/* ========================================================================= */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[88vh] overflow-y-auto scrollbar-hide animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-md">
                    {viewingProduct.brand_name || "Shaz Al Oud"}
                  </span>
                  {viewingProduct.is_featured && (
                    <span className="text-[10px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      ★ Featured
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-serif text-white mt-1">
                  {viewingProduct.our_signature || viewingProduct.name}
                  {viewingProduct.name_ar && (
                    <span className="text-sm font-sans text-amber-300 font-normal ml-2">
                      ({viewingProduct.name_ar})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Category: <span className="text-neutral-200">{viewingProduct.category?.name || "Uncategorized"}</span>
                </p>
              </div>

              <button
                onClick={() => setViewingProduct(null)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product Images & Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 space-y-2">
                <div className="w-full h-40 rounded-xl bg-[#fbf9f6] border border-neutral-800 flex items-center justify-center p-2 overflow-hidden">
                  <img
                    src={viewingProduct.image_url}
                    alt={viewingProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {viewingProduct.images && viewingProduct.images.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {viewingProduct.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-lg bg-[#fbf9f6] border border-neutral-800 flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0"
                      >
                        <img src={img} alt="" className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 space-y-3">
                {viewingProduct.description && (
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Fragrance Notes &amp; Description
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                      {viewingProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-850">
                    <span className="text-[10px] uppercase text-neutral-500 block">URL Slug</span>
                    <span className="font-mono text-neutral-300 text-[11px] truncate block">
                      {viewingProduct.slug || "—"}
                    </span>
                  </div>
                  <div className="bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-850">
                    <span className="text-[10px] uppercase text-neutral-500 block">Overall Status</span>
                    <span className={`text-[11px] font-medium ${viewingProduct.is_in_stock ? "text-emerald-400" : "text-red-400"}`}>
                      {viewingProduct.is_in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Variants & Multi-Country Pricing Table */}
            <div className="space-y-4 pt-3 border-t border-neutral-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Volume Variants &amp; Country Pricing
              </h3>

              {(!viewingProduct.variants || viewingProduct.variants.length === 0) ? (
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{viewingProduct.volume || "30ml"}</span>
                    <span className="text-amber-400 font-mono font-semibold">{viewingProduct.price} QAR</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewingProduct.variants.map((v, idx) => {
                    const hasPrices = v.prices && Object.keys(v.prices).length > 0;

                    return (
                      <div key={idx} className="bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden">
                        <div className="bg-neutral-900/80 px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-white bg-neutral-950 px-2 py-0.5 rounded border border-neutral-700">
                              {v.volume}
                            </span>
                            <span className={`text-[10px] font-medium ${v.is_in_stock !== false ? "text-emerald-400" : "text-red-400"}`}>
                              {v.is_in_stock !== false ? "● Available" : "● Out of Stock"}
                            </span>
                          </div>
                          {!hasPrices && (
                            <span className="font-mono text-xs font-semibold text-amber-400">
                              {v.price} QAR
                            </span>
                          )}
                        </div>

                        {(() => {
                          const validPriceEntries = Object.entries(v.prices || {}).filter(([code]) =>
                            countries.some((c) => c.code.toUpperCase().trim() === code.toUpperCase().trim())
                          );

                          if (validPriceEntries.length === 0) {
                            return (
                              <div className="py-3 px-4 text-xs text-neutral-500 bg-neutral-950">
                                {countries.length === 0
                                  ? "No countries configured yet. Add countries in Country Management."
                                  : "No country-specific pricing configured for this volume."}
                              </div>
                            );
                          }

                          return (
                            <table className="w-full text-left text-xs">
                              <thead className="bg-neutral-950 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-850">
                                <tr>
                                  <th className="py-2 px-4">Country</th>
                                  <th className="py-2 px-4">Currency</th>
                                  <th className="py-2 px-4">Selling Price</th>
                                  <th className="py-2 px-4">Original Price</th>
                                  <th className="py-2 px-4 text-center">Stock</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-850">
                                {validPriceEntries.map(([code, cp]) => {
                                  const countryObj = countries.find(
                                    (c) => c.code.toUpperCase().trim() === code.toUpperCase().trim()
                                  );
                                  const displayName = countryObj?.name || code;
                                  const displayCurrency = countryObj?.currency_code || code;
                                  const displaySymbol = countryObj?.currency_symbol || "";

                                  return (
                                    <tr key={code} className="hover:bg-neutral-900/30 transition-colors">
                                      <td className="py-2 px-4 font-medium text-white text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="w-6 h-6 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-center font-mono font-bold text-[10px] text-amber-400 flex-shrink-0">
                                            {countryObj?.code || code}
                                          </span>
                                          <span>{displayName}</span>
                                        </div>
                                      </td>
                                      <td className="py-2 px-4 font-mono text-xs text-neutral-300">
                                        <span className="text-amber-400 font-semibold">{displayCurrency}</span>
                                        {displaySymbol && (
                                          <span className="text-neutral-500 text-[11px] ml-1.5">{displaySymbol}</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-4 font-mono text-amber-400 font-semibold text-xs">
                                        {Number(cp.price).toFixed(0)} {displayCurrency}
                                      </td>
                                      <td className="py-2 px-4 font-mono text-neutral-500 text-xs">
                                        {cp.original_price != null ? (
                                          <span className="line-through">{Number(cp.original_price).toFixed(0)} {displayCurrency}</span>
                                        ) : (
                                          "—"
                                        )}
                                      </td>
                                      <td className="py-2 px-4 text-center">
                                        <span
                                          className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                                            cp.is_in_stock !== false
                                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                              : "bg-red-950/60 text-red-400 border border-red-800/40"
                                          }`}
                                        >
                                          {cp.is_in_stock !== false ? "In Stock" : "Out of Stock"}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = viewingProduct;
                  setViewingProduct(null);
                  startEdit(p);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={!!deleteModal?.isOpen}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this fragrance product? This will permanently remove its multi-country pricing and all product images from Cloudinary storage."
        itemName={deleteModal?.name}
        loading={deleting}
        confirmText="Delete Product"
      />
    </div>
  );
}

