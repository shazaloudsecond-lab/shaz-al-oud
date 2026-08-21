"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturedBanner() {
  const { featuredBanner, loadingStore } = useStore();
  const { tDynamic } = useLanguage();

  if (loadingStore) {
    return (
      <section className="w-full bg-black py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Skeleton Left: Content + Plus Grid */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <div className="h-10 sm:h-12 w-3/4 bg-neutral-900 animate-pulse rounded" />
            <div className="h-4 w-full bg-neutral-900 animate-pulse rounded" />
            <div className="w-full aspect-square max-w-[440px] bg-neutral-900/60 animate-pulse rounded-2xl" />
          </div>
          {/* Skeleton Right: Image */}
          <div className="lg:col-span-6 w-full h-[360px] sm:h-[480px] lg:h-[580px] bg-neutral-900 animate-pulse order-1 lg:order-2" />
        </div>
      </section>
    );
  }

  if (!featuredBanner || !featuredBanner.image_url) {
    return null;
  }

  const features = featuredBanner.features || [];
  const hasFeatures = features.some((f) => f && (f.heading || f.icon_url));

  return (
    <section className="relative w-full bg-black py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 select-none overflow-hidden">
      {/* Section Background Image */}
      {(featuredBanner.background_image_url || featuredBanner.image_url) && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={featuredBanner.background_image_url || featuredBanner.image_url}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55 sm:from-black/35 sm:via-black/15 sm:to-black/45" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Side: Heading, Subheading & 2x2 "Plus" Feature Grid */}
        <div className="lg:col-span-6 flex flex-col justify-center items-start text-start space-y-6 sm:space-y-8 order-2 lg:order-1 w-full">
          {/* Top Titles */}
          <div className="space-y-3 sm:space-y-4 flex flex-col items-center">
            {featuredBanner.heading && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-secondary font-normal text-[#f0d5c8] leading-tight tracking-normal">
                {tDynamic(featuredBanner.heading)}
              </h2>
            )}

            {featuredBanner.subheading && (
              <p className="text-sm sm:text-base font-secondary font-light text-neutral-300 leading-relaxed max-w-sm text-center">
                {tDynamic(featuredBanner.subheading)}
              </p>
            )}
          </div>

          {/* 2x2 Feature Grid with "Plus" Curved Star Dividers */}
          {hasFeatures && (
            <div className="relative w-full max-w-[480px] aspect-square rounded-2xl overflow-hidden p-2 sm:p-4 shadow-2xl shadow-black/80">
              {/* SVG Plus / Cross Center Curved Fillet Divider Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none text-[#dfc3b4]/50 z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="none"
              >
                {/* Top-Left quadrant curved divider */}
                <path
                  d="M 4 50 L 38 50 C 46 50 50 46 50 38 L 50 4"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                />
                {/* Top-Right quadrant curved divider */}
                <path
                  d="M 96 50 L 62 50 C 54 50 50 46 50 38 L 50 4"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                />
                {/* Bottom-Left quadrant curved divider */}
                <path
                  d="M 4 50 L 38 50 C 46 50 50 54 50 62 L 50 96"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                />
                {/* Bottom-Right quadrant curved divider */}
                <path
                  d="M 96 50 L 62 50 C 54 50 50 54 50 62 L 50 96"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                />

                {/* Ambient Center Glow Dot */}
                <circle cx="50" cy="50" r="1.5" fill="#f5d061" opacity="0.8" />
              </svg>

              {/* 4 Quadrants Content */}
              <div className="relative z-0 w-full h-full grid grid-cols-2 grid-rows-2">
                {/* Q1: Top-Left (Icon on Top, Heading on Bottom) */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 text-center group/q1">
                  {features[0]?.icon_url && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-2 sm:mb-3 transition-transform duration-500 group-hover/q1:scale-110">
                      <img
                        src={features[0].icon_url}
                        alt={features[0].heading || "Feature 1"}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(223,195,180,0.3)]"
                      />
                    </div>
                  )}
                  {features[0]?.heading && (
                    <h4 className="text-xs sm:text-sm md:text-base font-secondary text-[#f0d5c8] leading-snug tracking-wide max-w-[140px]">
                      {tDynamic(features[0].heading)}
                    </h4>
                  )}
                </div>

                {/* Q2: Top-Right (Icon on Top, Heading on Bottom) */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 text-center group/q2">
                  {features[1]?.icon_url && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-2 sm:mb-3 transition-transform duration-500 group-hover/q2:scale-110">
                      <img
                        src={features[1].icon_url}
                        alt={features[1].heading || "Feature 2"}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(223,195,180,0.3)]"
                      />
                    </div>
                  )}
                  {features[1]?.heading && (
                    <h4 className="text-xs sm:text-sm md:text-base font-secondary text-[#f0d5c8] leading-snug tracking-wide max-w-[140px]">
                      {tDynamic(features[1].heading)}
                    </h4>
                  )}
                </div>

                {/* Q3: Bottom-Left (Heading on Top, Icon on Bottom) */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 text-center group/q3">
                  {features[2]?.heading && (
                    <h4 className="text-xs sm:text-sm md:text-base font-secondary text-[#f0d5c8] leading-snug tracking-wide max-w-[140px] mb-2 sm:mb-3">
                      {tDynamic(features[2].heading)}
                    </h4>
                  )}
                  {features[2]?.icon_url && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-transform duration-500 group-hover/q3:scale-110">
                      <img
                        src={features[2].icon_url}
                        alt={features[2].heading || "Feature 3"}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(223,195,180,0.3)]"
                      />
                    </div>
                  )}
                </div>

                {/* Q4: Bottom-Right (Heading on Top, Icon on Bottom) */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 text-center group/q4">
                  {features[3]?.heading && (
                    <h4 className="text-xs sm:text-sm md:text-base font-secondary text-[#f0d5c8] leading-snug tracking-wide max-w-[140px] mb-2 sm:mb-3">
                      {tDynamic(features[3].heading)}
                    </h4>
                  )}
                  {features[3]?.icon_url && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-transform duration-500 group-hover/q4:scale-110">
                      <img
                        src={features[3].icon_url}
                        alt={features[3].heading || "Feature 4"}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(223,195,180,0.3)]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Featured Image */}
        <div className="lg:col-span-6 w-full order-1 lg:order-2">
          <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[580px] bg-neutral-950 overflow-hidden group shadow-2xl rounded-[10px]">
            <img
              src={featuredBanner.image_url}
              alt={featuredBanner.heading ? tDynamic(featuredBanner.heading) : "Featured Banner"}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle Gradient Hover Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
