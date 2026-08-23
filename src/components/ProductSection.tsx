"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "@/components/ProductCard";

export default function ProductSection() {
  const { categories, products, loadingStore: loading } = useStore();
  const { country, resolvePrice } = useCountry();
  const { t, tDynamic, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filtered products (up to 8 for 2 rows of 4 on desktop, 2 rows of 2 on mobile)
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Filter by Country Availability
    if (country) {
      list = list.filter((p) => resolvePrice(p).is_available);
    }

    // Filter by Category
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category_id === selectedCategory);
    }

    return list.slice(0, 8);
  }, [products, resolvePrice, country, selectedCategory]);

  // If loading and no products exist yet, show skeleton grid
  if (loading) {
    return (
      <section className="w-full bg-black text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          {/* Skeleton Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
            <div className="flex items-center gap-6">
              <div className="h-4 w-28 bg-neutral-900 animate-pulse" />
              <div className="h-4 w-20 bg-neutral-900 animate-pulse" />
              <div className="h-4 w-20 bg-neutral-900 animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-neutral-900 animate-pulse" />
          </div>

          {/* Skeleton Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-14">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i, idx) => (
              <div key={i} className={`flex-col items-center text-center space-y-4 ${idx >= 4 ? "hidden lg:flex" : "flex"}`}>
                <div className="w-full aspect-square bg-neutral-900 animate-pulse" />
                <div className="h-4 w-3/4 bg-neutral-900 animate-pulse" />
                <div className="h-3 w-1/4 bg-neutral-900 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no products in database, do not show dummy data
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="collection" className="w-full bg-black text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* Header: Category Tabs & View More */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar -mb-px">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`pb-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase font-mono transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                selectedCategory === "all"
                  ? "border-[#f0d5c8] text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              {t("products.all_categories", "ALL FRAGRANCES")}
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`pb-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase font-mono transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                    isSelected
                      ? "border-[#f0d5c8] text-white"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  {tDynamic(cat.name)}
                </button>
              );
            })}
          </div>

          <Link
            href="/shop"
            className="pb-3.5 hover:text-neutral-100 text-neutral-400 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <span>{t("common.view_all", "View All")}</span>
            <svg className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Product Grid using reusable ProductCard */}
        {displayedProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <p className="text-sm font-medium">{t("products.no_products", "No fragrances available in this category.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-14">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={index >= 4 ? "hidden lg:flex" : "flex"}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
