"use client";

import React from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutBlendedSection() {
  const { aboutSectionFour, loadingStore } = useStore();
  const { tDynamic } = useLanguage();

  if (loadingStore) {
    return (
      <section className="w-full bg-black py-16 px-4 sm:px-6 lg:px-12 select-none border-t border-neutral-900">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="w-full h-80 bg-neutral-900 rounded-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-12 bg-neutral-900 rounded-none" />
            <div className="lg:col-span-7 space-y-3">
              <div className="h-4 bg-neutral-900 rounded-none w-full" />
              <div className="h-4 bg-neutral-900 rounded-none w-5/6" />
              <div className="h-4 bg-neutral-900 rounded-none w-4/6" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No mock data: If not configured or not active, don't show mock data
  if (
    !aboutSectionFour ||
    !aboutSectionFour.is_active ||
    (!aboutSectionFour.image_url && !aboutSectionFour.heading && !aboutSectionFour.description)
  ) {
    return null;
  }

  const hasImage = Boolean(aboutSectionFour.image_url);

  return (
    <section className="w-full bg-black text-white select-none relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-16 sm:pb-24">
        {/* Top Image — Decreased Height with Subtle Bottom Fade */}
        {hasImage && (
          <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-[360px] rounded-none overflow-hidden mb-8 sm:mb-12">
            <img
              src={aboutSectionFour.image_url!}
              alt={aboutSectionFour.heading || "Quality & Craftsmanship"}
              className="w-full h-full object-cover object-center rounded-none block"
            />

            {/* Soft, minimal bottom edge fade */}
            <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
          </div>
        )}

        {/* Bottom Content Area: Left Heading, Right Paragraphs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Bottom Left — Heading */}
          <div className="lg:col-span-5 space-y-3">
            {aboutSectionFour.subheading && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f0d5c8] font-mono">
                {tDynamic(aboutSectionFour.subheading)}
              </p>
            )}

            {aboutSectionFour.heading && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-primary text-white tracking-tight leading-tight uppercase">
                {tDynamic(aboutSectionFour.heading)}
              </h2>
            )}
          </div>

          {/* Bottom Right — Paragraphs */}
          <div className="lg:col-span-7 space-y-5 text-xs sm:text-sm font-secondary text-neutral-300 leading-relaxed">
            {aboutSectionFour.description && (
              <p className="whitespace-pre-line text-neutral-300">
                {tDynamic(aboutSectionFour.description)}
              </p>
            )}

            {aboutSectionFour.story && (
              <p className="whitespace-pre-line text-neutral-400 pt-3 border-t border-neutral-900/80">
                {tDynamic(aboutSectionFour.story)}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
