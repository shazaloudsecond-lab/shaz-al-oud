"use client";

import React from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutSection() {
  const { aboutSection, loadingStore } = useStore();
  const { tDynamic } = useLanguage();

  if (loadingStore) {
    return (
      <section className="w-full bg-black py-12 sm:py-16 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-6 w-full aspect-[4/3] bg-neutral-900 animate-pulse rounded-none" />
          <div className="lg:col-span-6 space-y-6">
            <div className="h-8 w-3/4 bg-neutral-900 rounded-none animate-pulse" />
            <div className="h-4 w-1/2 bg-neutral-900 rounded-none animate-pulse" />
            <div className="h-20 w-full bg-neutral-900 rounded-none animate-pulse" />
            <div className="h-20 w-full bg-neutral-900 rounded-none animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // No mock data: If not configured or not active, don't show mock data
  if (
    !aboutSection ||
    !aboutSection.is_active ||
    (!aboutSection.image_url && !aboutSection.heading && !aboutSection.description)
  ) {
    return null;
  }

  const hasImage = Boolean(aboutSection.image_url);

  return (
    <section className="w-full bg-black py-10 sm:py-10 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto">
        <div
          className={`grid grid-cols-1 ${
            hasImage ? "lg:grid-cols-12" : "max-w-3xl mx-auto"
          } gap-10 lg:gap-16 items-center`}
        >
          {/* Left Side — Image Component (Mobile First: stacked, Desktop: Left Column) */}
          {hasImage && (
            <div className="lg:col-span-6 w-full">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] bg-neutral-950 border border-neutral-900 rounded-none overflow-hidden group shadow-2xl">
                <Image
                  src={aboutSection.image_url!}
                  alt={aboutSection.heading || "About Shaz Al Oud"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Right Side — Write Component (Heading, Subheading, Description & Story) */}
          <div className={`${hasImage ? "lg:col-span-6" : "w-full"} space-y-6 sm:space-y-8`}>
            {/* Header Area */}
            <div className="space-y-3">
              {aboutSection.subheading && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f0d5c8] font-mono">
                  {tDynamic(aboutSection.subheading)}
                </p>
              )}

              {aboutSection.heading && (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-primary text-white tracking-tight uppercase leading-snug">
                  {tDynamic(aboutSection.heading)}
                </h1>
              )}
            </div>

            {/* Content & Story Paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm font-secondary text-neutral-300 leading-relaxed">
              {aboutSection.description && (
                <p className="whitespace-pre-line text-neutral-300">
                  {tDynamic(aboutSection.description)}
                </p>
              )}

              {aboutSection.story && (
                <p className="whitespace-pre-line text-neutral-400 pt-2 border-t border-neutral-900">
                  {tDynamic(aboutSection.story)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
