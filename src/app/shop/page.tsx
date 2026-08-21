"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

const INITIAL_BATCH_SIZE = 8;
const LOAD_MORE_BATCH_SIZE = 8;

interface DropdownOption {
  label: string;
  value: string;
}

function CustomSelect({
  value,
  options,
  onChange,
  align = "left",
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  align?: "left" | "right";
}) {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // In RTL, align="right" (end) means left-0, and align="left" (start) means right-0
  const dropdownPlacementClass =
    align === "right"
      ? isRTL
        ? "left-0"
        : "right-0"
      : isRTL
      ? "right-0"
      : "left-0";

  return (
    <div ref={dropdownRef} className="relative inline-block text-start">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-neutral-900 px-3.5 py-2 text-xs uppercase tracking-wider cursor-pointer font-mono flex items-center justify-between gap-3 transition-all select-none ${
          isOpen ? "text-white" : "text-neutral-200"
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${dropdownPlacementClass} mt-1 w-56 bg-neutral-950 shadow-2xl z-50 py-1 max-h-64 overflow-y-auto no-scrollbar`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-start px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-neutral-900 text-amber-400 font-semibold"
                    : "text-neutral-300 hover:bg-neutral-900/80 hover:text-white"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  const { products, categories, loadingStore } = useStore();
  const { addToCart } = useCart();
  const { formatPrice, resolvePrice, country } = useCountry();
  const { t, tDynamic, isRTL } = useLanguage();

  // Filters State
  const [selectedVolume, setSelectedVolume] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<"featured" | "price-low" | "price-high" | "name">("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Pagination / Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Dropdown Options
  const priceRangeOptions = useMemo(
    () => [
      { label: t("products.all_prices", "All Prices"), value: "all" },
      { label: `${t("products.price_under", "Under")} ${formatPrice(100)}`, value: "under-100" },
      { label: `${formatPrice(100)} – ${formatPrice(300)}`, value: "100-300" },
      { label: `${formatPrice(300)} – ${formatPrice(500)}`, value: "300-500" },
      { label: `${t("products.price_above", "Above")} ${formatPrice(500)}`, value: "above-500" },
    ],
    [formatPrice, t]
  );

  const sortOptions = useMemo(
    () => [
      { label: t("products.sort_featured", "Sort: Featured"), value: "featured" },
      { label: t("products.price_low_high", "Price: Low to High"), value: "price-low" },
      { label: t("products.price_high_low", "Price: High to Low"), value: "price-high" },
      { label: t("products.sort_alphabetical", "Alphabetical"), value: "name" },
    ],
    [t]
  );

  const categoryOptions = useMemo(
    () => [
      { label: t("products.all_categories", "All Categories"), value: "all" },
      ...categories.map((c) => ({ label: tDynamic(c.name), value: c.id })),
    ],
    [categories, t, tDynamic]
  );

  // Filter and sort products (No mock data, all real DB data)
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Country Availability
    if (country) {
      list = list.filter((p) => resolvePrice(p).is_available);
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category_id === selectedCategory);
    }

    // 3. Volume Filter (30ml, 50ml, 100ml)
    if (selectedVolume !== "all") {
      const volQuery = selectedVolume.toLowerCase().replace(/[^0-9]/g, ""); // e.g. "30", "50", "100"
      list = list.filter((p) => {
        const mainVol = p.volume ? p.volume.toLowerCase() : "";
        if (mainVol.includes(volQuery)) return true;

        if (p.variants && Array.isArray(p.variants)) {
          return p.variants.some((v) => v.volume && v.volume.toLowerCase().includes(volQuery));
        }

        return false;
      });
    }

    // 4. Price Range Filter
    if (priceRange !== "all") {
      list = list.filter((p) => {
        const itemPrice = resolvePrice(p).price;
        if (priceRange === "under-100") return itemPrice < 100;
        if (priceRange === "100-300") return itemPrice >= 100 && itemPrice <= 300;
        if (priceRange === "300-500") return itemPrice > 300 && itemPrice <= 500;
        if (priceRange === "above-500") return itemPrice > 500;
        return true;
      });
    }

    // 5. Price / Alphabetical Sorting
    if (priceSort === "price-low") {
      list.sort((a, b) => resolvePrice(a).price - resolvePrice(b).price);
    } else if (priceSort === "price-high") {
      list.sort((a, b) => resolvePrice(b).price - resolvePrice(a).price);
    } else if (priceSort === "name") {
      list.sort((a, b) => (a.our_signature || a.name).localeCompare(b.our_signature || b.name));
    }

    return list;
  }, [products, country, selectedCategory, selectedVolume, priceRange, priceSort, resolvePrice]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [selectedVolume, selectedCategory, priceSort, priceRange]);

  // Infinite Scroll Observer
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredProducts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_BATCH_SIZE, filteredProducts.length));
      setIsLoadingMore(false);
    }, 400);
  }, [isLoadingMore, visibleCount, filteredProducts.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "250px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasActiveFilters = selectedVolume !== "all" || selectedCategory !== "all" || priceSort !== "featured" || priceRange !== "all";

  const resetFilters = () => {
    setSelectedVolume("all");
    setSelectedCategory("all");
    setPriceSort("featured");
    setPriceRange("all");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto space-y-8">
        
          {/* Breadcrumb & Top Bar */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 font-mono">
            <Link href="/" className="hover:text-white transition-colors">
              {t("nav.home", "Home")}
            </Link>
            <span>/</span>
            <span className="text-neutral-300">{t("nav.collection", "Shop")}</span>
          </div>

          {/* Page Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-primary uppercase tracking-wide text-white">
                {t("products.all_categories", "All Fragrances")}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-mono">
                {filteredProducts.length} {t("products.items_available", "luxury creations available")}
              </p>
            </div>

            {/* Quick Volume Filter Pills (Desktop Only) */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
                {t("products.size", "Volume:")}
              </span>
              {[
                { label: t("products.all_sizes", "All Sizes"), value: "all" },
                { label: tDynamic("30ml"), value: "30ml" },
                { label: tDynamic("50ml"), value: "50ml" },
                { label: tDynamic("100ml"), value: "100ml" },
              ].map((vol) => (
                <button
                  key={vol.value}
                  type="button"
                  onClick={() => setSelectedVolume(vol.value)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer font-mono ${
                    selectedVolume === vol.value
                      ? "bg-white text-black"
                      : "bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {vol.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter & Sort Controls */}
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4 relative z-30">
            {/* Start Side: Mobile Filter Button & Desktop Category/Price Filters */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Filter Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex sm:hidden items-center gap-2 bg-neutral-900 px-3.5 py-2 text-xs uppercase tracking-wider font-mono text-neutral-200 cursor-pointer transition-colors hover:text-white select-none rounded-[10px]"
              >
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>{t("products.filter", "Filters")}</span>
                {((selectedCategory !== "all" ? 1 : 0) + (selectedVolume !== "all" ? 1 : 0)) > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                    {(selectedCategory !== "all" ? 1 : 0) + (selectedVolume !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Desktop Category Dropdown */}
              {categories.length > 0 && (
                <div className="hidden sm:inline-block">
                  <CustomSelect
                    value={selectedCategory}
                    options={categoryOptions}
                    onChange={setSelectedCategory}
                    align="left"
                  />
                </div>
              )}

              {/* Desktop Price Range Dropdown (Hidden on Mobile) */}
              <div className="hidden sm:inline-block">
                <CustomSelect
                  value={priceRange}
                  options={priceRangeOptions}
                  onChange={setPriceRange}
                  align="left"
                />
              </div>
            </div>

            {/* End Side: Sort By & Reset */}
            <div className="flex items-center gap-3">
              <CustomSelect
                value={priceSort}
                options={sortOptions}
                onChange={(val) => setPriceSort(val as any)}
                align="right"
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="hidden sm:inline-block px-3.5 py-2 bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 text-red-300 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer font-mono"
                >
                  {t("products.reset_filters", "Reset")}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Bottom-to-Top Filter Sheet */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 sm:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMobileFilterOpen(false)}
              />

              {/* Sheet Container (Bottom to Top) */}
              <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-neutral-950 rounded-t-2xl z-50 flex flex-col p-6 space-y-6 overflow-y-auto animate-in slide-in-from-bottom duration-300">
                {/* Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-primary">
                      {t("products.filter", "Filters")}
                    </h3>
                    {((selectedCategory !== "all" ? 1 : 0) + (selectedVolume !== "all" ? 1 : 0)) > 0 && (
                      <span className="w-5 h-5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
                        {(selectedCategory !== "all" ? 1 : 0) + (selectedVolume !== "all" ? 1 : 0)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs text-red-400 uppercase tracking-wider font-mono hover:underline cursor-pointer"
                      >
                        {t("products.reset_filters", "Reset")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
                      aria-label="Close"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Volume / Size Section (Inside filter on mobile) */}
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono">
                    {t("products.size", "Volume / Size")}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: t("products.all_sizes", "All Sizes"), value: "all" },
                      { label: tDynamic("30ml"), value: "30ml" },
                      { label: tDynamic("50ml"), value: "50ml" },
                      { label: tDynamic("100ml"), value: "100ml" },
                    ].map((vol) => (
                      <button
                        key={vol.value}
                        type="button"
                        onClick={() => setSelectedVolume(vol.value)}
                        className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer font-mono text-center rounded-[10px] ${
                          selectedVolume === vol.value
                            ? "bg-white text-black"
                            : "bg-neutral-900 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {vol.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Section */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono">
                      {t("products.categories", "Categories")}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {categoryOptions.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer font-mono text-center truncate rounded-[10px] ${
                            selectedCategory === cat.value
                              ? "bg-white text-black"
                              : "bg-neutral-900 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] text-black font-semibold text-xs uppercase tracking-widest text-center shadow-lg transition-all cursor-pointer font-sans"
                  >
                    {t("products.show_results", "Apply Filters")} ({filteredProducts.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeletons for initial page load */}
          {loadingStore ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4 animate-pulse">
                  <div className="w-full aspect-[4/4.5] sm:aspect-square bg-neutral-900" />
                  <div className="h-4 w-3/4 bg-neutral-900" />
                  <div className="h-3 w-1/4 bg-neutral-900" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center space-y-4 border border-neutral-800 bg-neutral-950 p-8">
              <p className="text-base text-neutral-300 font-serif">
                {t("products.no_matching_filters", "No fragrances match the selected filter criteria.")}
              </p>
              <p className="text-xs text-neutral-500 font-mono">
                {t("products.try_another_filter", "Try choosing another volume or clearing active price filters.")}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-3 bg-white hover:bg-[#f0d5c8] text-black text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer mt-2 font-mono"
                >
                  {t("products.clear_all_filters", "Clear All Filters")}
                </button>
              )}
            </div>
          ) : (
            /* Products Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Infinite Scroll Sentinel & Loading Indicator */}
          <div ref={sentinelRef} className="pt-6 pb-12 flex flex-col items-center justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-400 font-mono">
                <div className="w-4 h-4 border-2 border-[#f0d5c8] border-t-transparent animate-spin" />
                <span>{t("products.loading_more", "Loading more fragrances...")}</span>
              </div>
            )}

            {!isLoadingMore && visibleCount >= filteredProducts.length && filteredProducts.length > 0 && (
              <p className="text-[11px] uppercase tracking-widest text-neutral-600 font-mono">
                {t("products.all_loaded", `All ${filteredProducts.length} fragrances loaded`)}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
