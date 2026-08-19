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
      <section className="w-full bg-black py-10 px-4 sm:px-6 lg:px-12 select-none border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-neutral-900" />
              <div className="h-4 w-24 bg-neutral-900 rounded" />
              <div className="h-3 w-32 bg-neutral-900 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Only show badges that have at least a heading or icon
  const visibleBadges = badges.filter((b) => b.heading || b.icon_url);
  if (visibleBadges.length === 0) return null;

  return (
    <section className="w-full bg-[#4A3522] py-10 sm:py-14 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        {visibleBadges.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center text-center gap-3 group"
          >
            {/* Icon */}
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 overflow-hidden">
              {badge.icon_url ? (
                <img
                  src={badge.icon_url}
                  alt={badge.heading || `Badge ${badge.position}`}
                  className="w-9 h-9 object-contain"
                />
              ) : (
                <svg className="w-7 h-7 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>

            {/* Text */}
            <div className="space-y-1">
              {badge.heading && (
                <p className="text-sm text-primary text-neutral-100 ">
                  {tDynamic(badge.heading)}
                </p>
              )}
              {badge.description && (
                <p className="text-xs text-neutral-400 text-primary">
                  {tDynamic(badge.description)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
