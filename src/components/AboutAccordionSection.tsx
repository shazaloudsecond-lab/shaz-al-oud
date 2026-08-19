"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutAccordionSection() {
  const { aboutSectionThree, loadingStore } = useStore();
  const { tDynamic } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  if (loadingStore) {
    return (
      <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-12 select-none bg-[#D8CBB6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-6 w-full aspect-[4/3] bg-black/10 animate-pulse rounded-none" />
          <div className="lg:col-span-6 space-y-6">
            <div className="h-8 w-3/4 bg-black/10 rounded-none animate-pulse" />
            <div className="h-4 w-1/2 bg-black/10 rounded-none animate-pulse" />
            <div className="h-16 w-full bg-black/10 rounded-none animate-pulse" />
            <div className="h-16 w-full bg-black/10 rounded-none animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // No mock data: Return null if inactive or no data
  if (
    !aboutSectionThree ||
    !aboutSectionThree.is_active ||
    (!aboutSectionThree.image_url &&
      !aboutSectionThree.heading &&
      (!aboutSectionThree.items || aboutSectionThree.items.length === 0))
  ) {
    return null;
  }

  const hasImage = Boolean(aboutSectionThree.image_url);
  const items = Array.isArray(aboutSectionThree.items) ? aboutSectionThree.items : [];
  const bgColor = aboutSectionThree.bg_color || "#D8CBB6";

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      style={{ backgroundColor: bgColor }}
      className="w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-12 select-none text-neutral-900 transition-colors"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`grid grid-cols-1 ${
            hasImage ? "lg:grid-cols-12" : "max-w-3xl mx-auto"
          } gap-10 lg:gap-16 items-start`}
        >
          {/* Left Side — Image Component (Mobile First: stacked, Desktop: Left Column) */}
          {hasImage && (
            <div className="lg:col-span-6 w-full">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] bg-black/10 border border-black/15 rounded-none overflow-hidden group shadow-lg">
                <Image
                  src={aboutSectionThree.image_url!}
                  alt={aboutSectionThree.heading || "Shaz Al Oud Details"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Right Side — Heading & Accordion Component */}
          <div className={`${hasImage ? "lg:col-span-6" : "w-full"} space-y-6 sm:space-y-8`}>
            {/* Header Area */}
            <div className="space-y-2">
              {aboutSectionThree.subheading && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-800 font-mono">
                  {tDynamic(aboutSectionThree.subheading)}
                </p>
              )}

              {aboutSectionThree.heading && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-primary text-neutral-950 tracking-tight uppercase leading-snug">
                  {tDynamic(aboutSectionThree.heading)}
                </h2>
              )}
            </div>

            {/* Accordion List (Zero Border Radius) */}
            {items.length > 0 && (
              <div className="border-t border-black/20 divide-y divide-black/20">
                {items.map((item, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div key={item.id || idx} className="py-4 rounded-none transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(idx)}
                        className="w-full flex items-center justify-between text-left gap-4 rounded-none cursor-pointer group py-1"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm sm:text-base font-semibold text-neutral-950 font-primary tracking-wide group-hover:text-black transition-colors">
                          {tDynamic(item.title)}
                        </span>
                        <div className="w-7 h-7 flex items-center justify-center rounded-none border border-black/30 flex-shrink-0 text-neutral-900 group-hover:border-black transition-all">
                          <span className="text-sm font-mono font-bold leading-none">
                            {isOpen ? "−" : "+"}
                          </span>
                        </div>
                      </button>

                      {isOpen && item.content && (
                        <div className="pt-3 pb-2 text-xs sm:text-sm text-neutral-800 leading-relaxed font-secondary whitespace-pre-line animate-fadeIn">
                          {tDynamic(item.content)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
