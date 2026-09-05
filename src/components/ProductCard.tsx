"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/context/StoreContext";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { formatPrice, resolvePrice } = useCountry();
  const { t, isRTL, getProductName } = useLanguage();

  const pricing = resolvePrice(product);
  const displayName = getProductName(product);

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group flex flex-col items-center text-center ${className}`}
    >
      {/* Image Card Container */}
      <div className="w-full aspect-[4/5] bg-neutral-950 overflow-hidden relative flex items-center justify-center transition-all duration-300 group-hover:border-neutral-700">
        <img
          src={product.image_url}
          alt={displayName}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Out of Stock Badge */}
        {!product.is_in_stock || !pricing.is_in_stock ? (
          <div className={`absolute top-2.5 ${isRTL ? "left-2.5" : "right-2.5"} bg-neutral-950/90 backdrop-blur-sm text-neutral-300 border border-neutral-800 text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium`}>
            {t("common.out_of_stock", "Sold Out")}
          </div>
        ) : (
          /* Add to Cart button on hover */
          <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-4 sm:bottom-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 hidden sm:block">
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
              className="w-full py-2.5 px-4 bg-white hover:bg-white text-black text-xs font-semibold uppercase tracking-widest text-center shadow-lg transition-colors cursor-pointer"
            >
              {t("products.add_to_bag", "Add to Cart")}
            </button>
          </div>
        )}
      </div>

      {/* Product Meta */}
      <div className="mt-3 sm:mt-5 space-y-1 sm:space-y-1.5 w-full px-1">
        <h3 className="text-xs sm:text-base font-serif font-normal text-neutral-100 tracking-normal group-hover:text-[#f0d5c8] transition-colors line-clamp-1">
          {displayName}
        </h3>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
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
}
