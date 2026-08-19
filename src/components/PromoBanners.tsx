"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function PromoBanners() {
  const { promoBanner, loadingStore } = useStore();
  const { tDynamic } = useLanguage();

  // Skeleton loading state
  if (loadingStore) {
    return (
      <section className="w-full bg-black py-8 sm:py-12 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div className="h-8 w-64 mx-auto bg-neutral-900 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="w-full aspect-[16/10] bg-neutral-900 rounded-[0px] animate-pulse" />
            <div className="w-full aspect-[16/10] bg-neutral-900 rounded-[0px] animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // If no banners in database or inactive, do not show any mock data
  if (!promoBanner || !promoBanner.left_image_url || !promoBanner.right_image_url) {
    return null;
  }

  const renderBannerCard = (imageUrl: string, linkUrl?: string | null, altText: string = "Promotional Banner") => {
    const hasLink = linkUrl && linkUrl !== "#";
    const CardContent = (
      <div className="group relative w-full aspect-[16/10] border-none rounded-[0px] overflow-hidden bg-neutral-950 shadow-2xl transition-all duration-500 hover:shadow-black/50">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-cover border-none transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>
    );

    if (hasLink) {
      return (
        <Link href={linkUrl} className="block w-full cursor-pointer focus:outline-none">
          {CardContent}
        </Link>
      );
    }

    return <div className="w-full">{CardContent}</div>;
  };

  return (
    <section className="w-full bg-black py-8 sm:py-12 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Heading — only shown when set in admin */}
        {promoBanner.heading && (
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-primary text-white mb-10 sm:mb-14 px-2">
              {tDynamic(promoBanner.heading)}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {renderBannerCard(promoBanner.left_image_url, promoBanner.left_link, "Left Promotional Highlight")}
          {renderBannerCard(promoBanner.right_image_url, promoBanner.right_link, "Right Promotional Highlight")}
        </div>
      </div>
    </section>
  );
}
