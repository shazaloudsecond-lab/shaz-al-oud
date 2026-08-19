"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturedBanner() {
  const { featuredBanner, loadingStore } = useStore();
  const { tDynamic } = useLanguage();

  if (loadingStore) {
    return (
      <section className="w-full bg-black select-none">
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-neutral-900 animate-pulse" />
      </section>
    );
  }

  if (!featuredBanner || !featuredBanner.image_url) {
    return null;
  }

  return (
    <section className="w-full bg-black select-none overflow-hidden">
      <div className="relative group w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden shadow-2xl transition-all duration-500">
        <img
          src={featuredBanner.image_url}
          alt="Featured"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
        
        {/* Text container positioned bottom center on mobile, top right on desktop (fixed position in both English & Arabic) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:bottom-auto sm:left-auto sm:translate-x-0 sm:top-12 sm:right-12 md:right-16 lg:right-24 flex flex-col items-center text-center w-full max-w-[80vw] sm:max-w-[500px]">
          {featuredBanner.heading && (
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-primary text-[#f0d5c8] mb-1 sm:mb-2 drop-shadow-md whitespace-nowrap">
              {tDynamic(featuredBanner.heading)}
            </h2>
          )}
          {featuredBanner.subheading && (
            <p className="text-[10px] sm:text-base font-secondary text-neutral-200 drop-shadow">
              {tDynamic(featuredBanner.subheading)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
