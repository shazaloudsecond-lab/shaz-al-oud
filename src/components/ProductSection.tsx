"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductSection() {
  const { products, loadingStore: loading } = useStore();
  const { addToCart } = useCart();
  const { formatPrice, resolvePrice, country } = useCountry();
  const { t, tDynamic, isRTL } = useLanguage();

  // Filtered products (up to 8 for 2 rows of 4 on desktop, 2 rows of 2 on mobile)
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Filter by Country Availability
    if (country) {
      list = list.filter((p) => resolvePrice(p).is_available);
    }

    return list.slice(0, 8);
  }, [products, resolvePrice, country]);

  // If loading and no products exist yet, show skeleton grid
  if (loading) {
    return (
      <section className="w-full bg-black text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          {/* Skeleton Header */}
          <div className="flex items-center justify-between pb-4">
            <div className="h-4 w-32 bg-neutral-900 animate-pulse" />
            <div className="h-8 w-24 bg-neutral-900 animate-pulse" />
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
        {/* Header: Title & View More */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="relative text-xs sm:text-sm font-semibold tracking-wider uppercase text-white font-mono">
            <span className="border-b-2 border-[#f0d5c8] pb-4 inline-block -mb-[17px]">
              {t("products.all_categories", "ALL FRAGRANCES")}
            </span>
          </h2>

          <Link
            href="/shop"
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-1.5"
          >
            <span>{t("common.view_all", "View All")}</span>
            <svg className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Product Grid */}
        {displayedProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <p className="text-sm font-medium">{t("products.no_products", "No fragrances available in this category.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-14">
            {displayedProducts.map((product, index) => {
              const pricing = resolvePrice(product);
              const displayName = product.our_signature || product.name;

              return (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className={`group flex-col items-center text-center ${index >= 4 ? "hidden lg:flex" : "flex"}`}
                >
                  {/* Product Image Card Container */}
                  <div className="w-full aspect-[4/4.5] sm:aspect-square bg-white overflow-hidden relative flex items-center justify-center p-4 sm:p-6 transition-all duration-300 group-hover:border-neutral-700 group-hover:shadow-lg group-hover:shadow-black/50">
                    <img
                      src={product.image_url}
                      alt={displayName}
                      className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Out of stock badge if applicable */}
                    {!product.is_in_stock || !pricing.is_in_stock ? (
                      <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} bg-neutral-950/90 backdrop-blur-sm text-neutral-300 border border-neutral-800 text-[10px] uppercase tracking-wider px-2.5 py-1 font-medium`}>
                        {t("common.out_of_stock", "Sold Out")}
                      </div>
                    ) : (
                      /* Add to Cart Button on Hover */
                      <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(
                              {
                                ...product,
                                price: pricing.price,
                                original_price: pricing.original_price,
                                volume: pricing.volume,
                              },
                              1
                            );
                          }}
                          className="w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-[#f0d5c8] text-black text-xs font-semibold uppercase tracking-widest text-center shadow-lg transition-colors cursor-pointer"
                        >
                          {t("products.add_to_bag", "Add to Cart")}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product Meta: Title & Price */}
                  <div className="mt-4 sm:mt-5 space-y-1 sm:space-y-1.5">
                    <h3 className="text-sm sm:text-base lg:text-lg font-serif font-normal text-neutral-100 tracking-normal group-hover:text-[#f0d5c8] transition-colors line-clamp-1">
                      {tDynamic(displayName)}
                    </h3>

                    <div className="flex items-center justify-center gap-2">
                      <p className="text-xs sm:text-sm text-[#dfc3b4] font-semibold font-mono">
                        {formatPrice(pricing.price)}
                      </p>
                      {pricing.original_price != null && pricing.original_price > pricing.price && (
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 line-through font-mono">
                          {formatPrice(pricing.original_price)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
