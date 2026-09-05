"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function PromoBanners() {
  const { promoBanner, loadingStore } = useStore();
  const { tDynamic, isRTL, t } = useLanguage();

  // Skeleton loading state
  if (loadingStore) {
    return (
      <section className="w-full bg-black py-12 sm:py-16 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
          <div className="space-y-3 text-center">
            <div className="h-8 w-72 mx-auto bg-neutral-900 rounded-lg animate-pulse" />
            <div className="h-4 w-96 max-w-full mx-auto bg-neutral-900/60 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="w-full aspect-[16/10] bg-neutral-900 sm:rounded-3xl animate-pulse" />
            <div className="w-full aspect-[16/10] bg-neutral-900 sm:rounded-3xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // If no banners in database or inactive, do not show
  if (!promoBanner || !promoBanner.left_image_url || !promoBanner.right_image_url) {
    return null;
  }

  const renderBannerCard = (
    imageUrl: string,
    heading?: string | null,
    subheading?: string | null,
    linkUrl?: string | null,
    position: "left" | "right" = "left",
    iconType: "drop" | "bottle" = "drop"
  ) => {
    const hasLink = linkUrl && linkUrl !== "#";

    const CardInner = (
      <div className="group relative w-full aspect-[16/10] sm:rounded-sm overflow-hidden  shadow-[0_0_45px_rgba(255,255,255,0.18)] hover:shadow-[0_0_65px_rgba(255,255,255,0.30)] transition-all duration-500">
        {/* Background Image with subtle zoom */}
        <img
          src={imageUrl}
          alt={heading ? tDynamic(heading) : "Promotional Banner"}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay for Text Readability */}
        {/* <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            position === "left"
              ? "bg-gradient-to-tr from-black/90 via-black/40 to-transparent"
              : "bg-gradient-to-tl from-black/90 via-black/40 to-transparent"
          }`}
        /> */}

        {/* Floating Text & Icon Badge (Aligned to bottom) */}
        <div
          className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-end ${
            position === "left"
              ? "items-start text-left rtl:items-end rtl:text-right"
              : "items-end text-right rtl:items-start rtl:text-left"
          }`}
        >
          {/* Circular Badge Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#dfc3b4]/50 bg-black/60 backdrop-blur-md flex items-center justify-center text-[#dfc3b4] mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
            {iconType === "drop" ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#dfc3b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#dfc3b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 5h6a2 2 0 0 1 2 2v2H7V7a2 2 0 0 1 2-2zm-4 4h14v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9zm7 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
            )}
          </div>

          {/* Heading */}
          {heading && (
            <h3 className="text-xs sm:text-sm font-semibold tracking-[0.18em] text-[#dfc3b4] uppercase font-primary drop-shadow-sm">
              {tDynamic(heading)}
            </h3>
          )}

          {/* Subheading */}
          {subheading && (
            <p className="text-[11px] sm:text-xs text-neutral-300 font-light leading-relaxed max-w-[200px] sm:max-w-[240px] mt-1.5 drop-shadow-sm">
              {tDynamic(subheading)}
            </p>
          )}
        </div>
      </div>
    );

    if (hasLink) {
      return (
        <Link href={linkUrl} className="block w-full cursor-pointer focus:outline-none">
          {CardInner}
        </Link>
      );
    }

    return <div className="w-full">{CardInner}</div>;
  };

  return (
    <section className="relative w-full bg-black py-14 sm:py-20 px-4 sm:px-6 lg:px-12 select-none overflow-hidden">
      {/* Background Image with subtle atmospheric overlay */}
      {/* {promoBanner.background_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${promoBanner.background_image_url})` }}
        />
      )} */}

      {/* Subtle Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(223,195,180,0.06),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Section Header */}
        {(promoBanner.heading || promoBanner.subheading) && (
          <div className="text-center max-w-3xl mx-auto space-y-3 px-2">
            {promoBanner.heading && (
              <h2 className="text-2xl sm:text-3xl font-primary text-white tracking-wide sm:uppercase">
                {tDynamic(promoBanner.heading)}
              </h2>
            )}

            {/* Luxury Diamond Ornament */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="w-10 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-[#dfc3b4]/60" />
              <span className="text-[#dfc3b4] text-xs">◇</span>
              <span className="w-10 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-[#dfc3b4]/60" />
            </div>

            {promoBanner.subheading && (
              <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-xl mx-auto tracking-wide">
                {tDynamic(promoBanner.subheading)}
              </p>
            )}
          </div>
        )}

        {/* 2 Side-by-Side Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {renderBannerCard(
            promoBanner.left_image_url,
            promoBanner.left_heading,
            promoBanner.left_subheading,
            promoBanner.left_link,
            "left",
            "drop"
          )}
          {renderBannerCard(
            promoBanner.right_image_url,
            promoBanner.right_heading,
            promoBanner.right_subheading,
            promoBanner.right_link,
            "right",
            "bottle"
          )}
        </div>

        {/* Hardcoded Frontend Button */}
        <div className="flex justify-center pt-2 sm:pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center rounded-sm gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#d8b08c] via-[#dfc3b4] to-[#c99a70] hover:from-[#e3be9c] hover:to-[#d8aa80] text-black font-bold text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-[#dfc3b4]/20 hover:scale-105 cursor-pointer"
          >
            <span>{t("common.discover_scent", "DISCOVER YOUR SCENT")}</span>
            <svg
              className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
