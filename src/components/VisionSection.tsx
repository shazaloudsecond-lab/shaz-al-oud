"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function VisionSection() {
  const { visionSection, loadingStore } = useStore();
  const { tDynamic, isRTL } = useLanguage();

  if (loadingStore) {
    return (
      <section className="w-full bg-black select-none py-6 sm:py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto w-full h-[320px] sm:h-auto sm:aspect-[21/7] animate-pulse bg-neutral-900" />
      </section>
    );
  }

  if (!visionSection?.is_active || (!visionSection?.image_url && !visionSection?.heading)) {
    return null;
  }

  return (
    <section className="w-full bg-black select-none overflow-hidden py-6 sm:py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto relative w-full">
        {/* Landscape Image with increased mobile height */}
        <div className="relative w-full h-[320px] sm:h-auto sm:aspect-[21/7] overflow-hidden">
          {visionSection.image_url ? (
            <img
              src={visionSection.image_url}
              alt={visionSection.heading || "Vision"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}

          {/* Gradient overlay: bottom gradient on mobile, side gradient on desktop */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${
              isRTL
                ? "sm:bg-gradient-to-l sm:from-transparent sm:via-black/30 sm:to-black/80"
                : "sm:bg-gradient-to-r sm:from-transparent sm:via-black/30 sm:to-black/80"
            }`}
          />

          {/* Text overlay: positioned at bottom on mobile, side-aligned on desktop */}
          <div
            className={`absolute inset-0 flex items-end sm:items-center ${
              isRTL
                ? "justify-start text-start"
                : "justify-start sm:justify-end text-start"
            }`}
          >
            <div className="w-full sm:w-1/2 lg:w-2/5 px-5 pb-6 sm:pb-0 sm:px-10 lg:px-16 space-y-2 sm:space-y-3">
              {visionSection.heading && (
                <h2 className="font-secondary text-xl sm:text-3xl md:text-5xl text-white leading-tight tracking-normal font-normal">
                  {tDynamic(visionSection.heading)}
                </h2>
              )}
              {visionSection.description && (
                <p className="text-neutral-200 text-xs sm:text-sm md:text-base leading-relaxed font-secondary font-light max-w-sm">
                  {tDynamic(visionSection.description)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
