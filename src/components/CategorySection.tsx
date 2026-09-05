"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CategorySection() {
  const { categories, loadingStore } = useStore();
  const { t, tDynamic, isRTL } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Loading skeleton state
  if (loadingStore) {
    return (
      <section className="w-full bg-black py-8 sm:py-12 select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-primary text-white uppercase">
              Category
            </h2>
          </div>
          <div className="flex items-center justify-center gap-3 sm:gap-10 md:gap-14 overflow-hidden py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 space-y-3 sm:space-y-4">
                <div className="w-[94px] h-[94px] xs:w-[102px] xs:h-[102px] sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-full bg-neutral-900 animate-pulse border border-neutral-800" />
                <div className="w-16 sm:w-24 h-3 sm:h-3.5 bg-neutral-900 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Strictly no mock data: if no categories exist in database, do not render section
  if (!categories || categories.length === 0) {
    return null;
  }

  const isCenteredMobile = categories.length <= 3;

  return (
    <section
      aria-label="Categories"
      className="w-full bg-black py-8 sm:py-12 select-none"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Centered Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-primary text-white tracking-wider sm:uppercase">
            Category
          </h2>
        </div>

        {/* Categories Horizontal Scroll / Centered Row */}
        <div
          ref={scrollRef}
          className={`flex items-start ${
            isCenteredMobile ? "justify-center" : "justify-start"
          } sm:justify-center gap-3 sm:gap-10 md:gap-14 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1`}
        >
          {categories.map((cat) => {
            const displayName = tDynamic(cat.name);

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.id)}`}
                className="group flex flex-col items-center flex-shrink-0 transition-transform duration-300 hover:-translate-y-1 focus:outline-none"
              >
                {/* Round Shape Container */}
                <div className="w-[94px] h-[94px] xs:w-[102px] xs:h-[102px] sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-full p-[2.5px] sm:p-[3px] border border-neutral-800 group-hover:border-[#f0d5c8] transition-all duration-500 shadow-sm group-hover:shadow-[0_0_28px_rgba(240,213,200,0.22)] relative flex items-center justify-center bg-neutral-950">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-900 flex items-center justify-center">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      /* Luxury Fallback Icon if no image */
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-[#f0d5c8]/70 group-hover:text-[#f0d5c8] transition-colors p-4 sm:p-6">
                        <svg
                          className="w-8 h-8 sm:w-14 sm:h-14 md:w-16 md:h-16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="7" y="10" width="10" height="12" rx="2" />
                          <path d="M10 10V6a2 2 0 0 1 4 0v4" />
                          <path d="M12 2v2" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Name */}
                <span className="mt-2.5 sm:mt-4 text-[11px] sm:text-xs tracking-wider uppercase font-primary text-neutral-400 group-hover:text-white transition-colors text-center max-w-[96px] xs:max-w-[104px] sm:max-w-[140px] md:max-w-[170px] lg:max-w-[190px] truncate">
                  {displayName}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
