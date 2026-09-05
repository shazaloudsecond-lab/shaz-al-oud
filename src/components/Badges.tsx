"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Badges() {
  const { badges, loadingStore } = useStore();
  const { tDynamic } = useLanguage();

  // Skeleton
  if (loadingStore) {
    return (
      <section className="w-full bg-black py-8 sm:py-16 px-0 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto bg-gradient-to-b from-[#1e130a] via-[#140c06] to-[#0c0704] p-4 sm:p-10 rounded-none sm:rounded-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 sm:gap-3 animate-pulse">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-900/80 border border-[#d4af37]/20" />
                <div className="h-4 sm:h-5 w-20 sm:w-28 bg-neutral-900 rounded mt-1 sm:mt-2" />
                <div className="h-3 w-24 sm:w-36 bg-neutral-900/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Only show badges that have at least a heading or icon
  const visibleBadges = badges.filter((b) => b.heading || b.icon_url);
  if (visibleBadges.length === 0) return null;

  return (
    <section className="w-full bg-black py-8 sm:py-16 px-0 sm:px-6 lg:px-12 select-none overflow-hidden">
      {/* Outer luxury Frame Container */}
      <div className="max-w-7xl mx-auto relative group">
        {/* Luxury amber backdrop without outline border */}
        <div className="relative bg-gradient-to-b from-[#23160c] via-[#170e08] to-[#100905] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden rounded-none">
          
          {/* Subtle Ambient Radial Light in Center */}
          {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,rgba(0,0,0,0.6)_80%)] pointer-events-none" /> */}

          {/* Decorative Corner Ambient Glow / Golden Shimmer Ribbons */}
          {/* <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-[#d4af37]/15 to-transparent rounded-full blur-2xl pointer-events-none" /> */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48  rounded-full blur-2xl pointer-events-none" />

          {/* Grid of 4 Badges (2 columns on mobile, 4 on desktop) */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 py-2 sm:py-6">
            {visibleBadges.map((badge, index) => {
              const isNotLast = index < visibleBadges.length - 1;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={badge.id || badge.position || index}
                  className="relative px-3 sm:px-8 py-5 sm:py-10 flex flex-col items-center text-center group/badge"
                >
                  {/* Desktop Vertical Column Divider with Glowing Midpoint Diamond Dot */}
                  {isNotLast && (
                    <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-0 w-[1px] h-3/5 bg-gradient-to-b from-transparent via-[#d4af37]/35 to-transparent">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-[2px] w-1.5 h-1.5 rounded-full bg-[#fde68a] shadow-[0_0_6px_#f5d061]" />
                    </div>
                  )}

                  {/* Mobile Vertical Divider between column 1 and column 2 */}
                  {isEven && (
                    <div className="block lg:hidden absolute top-1/2 -translate-y-1/2 right-0 w-[1px] h-3/4 bg-gradient-to-b from-transparent via-[#d4af37]/30 to-transparent">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-[1.5px] w-1 h-1 rounded-full bg-[#fde68a] shadow-[0_0_4px_#f5d061]" />
                    </div>
                  )}

                  {/* Mobile Horizontal Divider between Row 1 and Row 2 */}
                  {index < 2 && (
                    <div className="block lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
                  )}

                  {/* Icon Container with Subtle Glow Halo */}
                  <div className="relative w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover/badge:scale-108">
                    {/* Glowing Halo */}
                    <div className="absolute inset-1 rounded-full bg-[#d4af37]/15 blur-md -z-10 group-hover/badge:bg-[#d4af37]/25 transition-all duration-300" />

                    {badge.icon_url ? (
                      <img
                        src={badge.icon_url}
                        alt={badge.heading || `Badge ${badge.position}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-[#d4af37]/50 bg-black/50 flex items-center justify-center text-[#d4af37]">
                        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Heading */}
                  {badge.heading && (
                    <h3 className="text-xs sm:text-lg font-primary text-[#f8f4ee] tracking-wide mt-3 sm:mt-5 mb-0.5 sm:mb-1 font-medium group-hover/badge:text-[#f7e099] transition-colors duration-300 leading-snug">
                      {tDynamic(badge.heading)}
                    </h3>
                  )}

                  {/* Elegant Diamond Ornament */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 my-1.5 sm:my-2.5 opacity-75">
                    <span className="w-3 sm:w-4 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]/60" />
                    <span className="text-[#d4af37] text-[7px] sm:text-[8px]">◆</span>
                    <span className="w-3 sm:w-4 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]/60" />
                  </div>

                  {/* Description */}
                  {badge.description && (
                    <p className="text-[10px] sm:text-xs text-[#cebeb2]/85 font-light leading-relaxed max-w-[155px] sm:max-w-[230px] mx-auto tracking-wide">
                      {tDynamic(badge.description)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
