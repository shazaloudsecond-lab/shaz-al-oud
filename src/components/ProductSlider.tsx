"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductSlider() {
  const { productSliderConfig, productSliderItems, loadingStore } = useStore();
  const { addToCart } = useCart();
  const { formatPrice, resolvePrice, country } = useCountry();
  const { t, tDynamic, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const posRef = useRef(0);

  const availableItems = country
    ? productSliderItems.filter((item) => item.product && resolvePrice(item.product).is_available)
    : productSliderItems;

  // Quadruple items for infinite seamless loop
  const repeated = availableItems.length > 0
    ? [...availableItems, ...availableItems, ...availableItems, ...availableItems]
    : [];

  // Continuous smooth sliding animation loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableItems.length === 0) return;

    // Initial position in the second block
    const cardEl = container.querySelector<HTMLElement>("[data-card]");
    const computedGap = parseFloat(window.getComputedStyle(container).gap) || 16;
    const cardWidth = cardEl ? cardEl.offsetWidth + computedGap : 300;
    const oneSetWidth = cardWidth * availableItems.length;

    if (posRef.current === 0) {
      posRef.current = oneSetWidth;
      container.scrollLeft = posRef.current;
    }

    // Speed in pixels per second
    const speed = 95;

    const animate = (time: number) => {
      if (lastTimeRef.current != null && !isHovered.current) {
        const delta = (time - lastTimeRef.current) / 1000;
        posRef.current += speed * delta;

        // Wrap around seamlessly
        if (posRef.current >= oneSetWidth * 2) {
          posRef.current -= oneSetWidth;
        } else if (posRef.current < oneSetWidth) {
          posRef.current += oneSetWidth;
        }

        container.scrollLeft = posRef.current;
      }
      lastTimeRef.current = time;
      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [availableItems.length]);

  if (loadingStore) {
    return (
      <section className="w-full bg-black py-16 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-[1400px] mx-auto mb-10">
          <div className="h-10 w-64 bg-neutral-900 rounded animate-pulse" />
        </div>
        <div className="flex gap-8 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[350px] space-y-4 animate-pulse">
              <div className="aspect-[4/5] bg-neutral-900 rounded-sm" />
              <div className="h-4 bg-neutral-900 rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!productSliderConfig?.is_active || productSliderItems.length === 0) {
    return null;
  }

  return (
    <section id="signature" className="w-full bg-black py-16 sm:py-24 px-4 sm:px-6 lg:px-12 select-none overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        {productSliderConfig.heading && (
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-primary text-white mb-10 sm:mb-14 px-2">
            {tDynamic(productSliderConfig.heading)}
          </h2>
        )}

        {/* Continuous Slider Container — stops continuous sliding on hover */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => {
            isHovered.current = true;
          }}
          onMouseLeave={() => {
            isHovered.current = false;
            lastTimeRef.current = null;
          }}
          onTouchStart={() => {
            isHovered.current = true;
          }}
          onTouchEnd={() => {
            isHovered.current = false;
            lastTimeRef.current = null;
          }}
          className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-hidden pb-6 sm:pb-8 will-change-scroll"
        >
          {repeated.map((item, index) => {
            const product = item.product;
            if (!product) return null;

            const originalIndex = index % (availableItems.length || 1);
            const idxStr = String(originalIndex + 1).padStart(2, "0");

            return (
              <div
                key={`${item.id}-${index}`}
                data-card
                className="flex-shrink-0 group w-[calc((100%-12px)/2)] sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-72px)/4)]"
              >
                <Link href={`/products/${product.id}`} className="block w-full h-full" draggable={false}>
                  {/* Image Container */}
                  <div
                    className="aspect-[4/5] relative overflow-hidden mb-2.5 sm:mb-4 transition-transform duration-500 group-hover:-translate-y-2 border border-neutral-800"
                    style={{ backgroundColor: item.bg_color || "#121212" }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-2.5 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">
                        No Image
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Add to Cart Button */}
                    <div className="absolute inset-x-2 bottom-2 sm:inset-x-4 sm:bottom-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 hidden sm:block">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const pr = resolvePrice(product);
                          addToCart({
                            ...product,
                            price: pr.price,
                            original_price: pr.original_price,
                            volume: pr.volume,
                          });
                        }}
                        className="w-full py-2.5 px-3 bg-black hover:bg-neutral-900 text-white text-xs font-semibold uppercase tracking-widest text-center shadow-lg transition-colors cursor-pointer"
                      >
                        {t("products.add_to_bag", "Add to Cart")}
                      </button>
                    </div>
                  </div>

                  {/* Text Container: Only product name and number on mobile, plus price and arrow on desktop */}
                  <div className="flex items-center justify-between text-neutral-400 group-hover:text-white transition-colors duration-300 font-secondary px-1 sm:px-2">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      <span className="text-[10px] sm:text-xs font-mono tracking-wider text-neutral-500 flex-shrink-0">{idxStr}</span>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm tracking-wider uppercase font-medium line-clamp-1 block truncate">
                          {tDynamic(product.our_signature || product.name)}
                        </span>
                        {/* <div className="hidden sm:block text-xs text-[#dfc3b4] font-mono font-medium mt-0.5">
                          {formatPrice(resolvePrice(product).price)}
                        </div> */}
                      </div>
                    </div>
                    <svg className={`hidden sm:block w-3.5 h-3.5 sm:w-4 sm:h-4 transform ${isRTL ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"} group-hover:-translate-y-1 transition-transform duration-300 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 7l-10 10M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
