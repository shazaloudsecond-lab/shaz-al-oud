"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function VisionSection() {
  const { visionSection, loadingStore } = useStore();
  const { tDynamic, isRTL } = useLanguage();

  if (loadingStore) {
    return (
      <section className="w-full bg-black select-none py-8 sm:py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto w-full aspect-[21/7] animate-pulse bg-neutral-900 rounded-xl" />
      </section>
    );
  }

  if (!visionSection?.is_active || (!visionSection?.image_url && !visionSection?.heading)) {
    return null;
  }

  return (
    <section className="w-full bg-black select-none overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto relative w-full">
        {/* Landscape Image */}
        <div className="relative w-full aspect-[21/8] sm:aspect-[21/7] overflow-hidden">
          {visionSection.image_url ? (
            <img
              src={visionSection.image_url}
              alt={visionSection.heading || "Vision"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}

          {/* Dark gradient overlay */}
          <div className={`absolute inset-0 ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-transparent via-black/30 to-black/80`} />

          {/* Text overlay */}
          <div className={`absolute inset-0 flex items-center ${isRTL ? "justify-start text-start" : "justify-end text-start"}`}>
            <div className="w-full sm:w-1/2 lg:w-2/5 px-8 sm:px-10 lg:px-16 space-y-4 sm:space-y-2">
              {visionSection.heading && (
                <h2 className="font-secondary text-3xl md:text-5xl text-white leading-tight tracking-tight">
                  {tDynamic(visionSection.heading)}
                </h2>
              )}
              {visionSection.description && (
                <p className="text-neutral-300 text-sm leading-relaxed font-secondary max-w-sm">
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
