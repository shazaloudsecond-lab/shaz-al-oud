"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function FullBanner() {
  const { fullBanner, loadingStore } = useStore();
  const { tDynamic } = useLanguage();

  if (loadingStore) {
    return (
      <section className="w-full bg-black py-4 sm:py-8 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto w-full h-48 sm:h-64 md:h-80 bg-neutral-900 rounded-[0px] animate-pulse" />
      </section>
    );
  }

  if (!fullBanner || !fullBanner.image_url) {
    return null;
  }

  const hasLink = Boolean(fullBanner.link_url && fullBanner.link_url !== "#");
  const rawButtonLabel = fullBanner.button_text?.trim();
  const buttonLabel = rawButtonLabel ? tDynamic(rawButtonLabel) : "";

  return (
    <section className="w-full bg-black py-4 sm:py-8 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto relative w-full h-48 sm:h-64 md:h-80 lg:h-[340px] rounded-[0px] overflow-hidden">
        {/* Static image with decreased height */}
        <img
          src={fullBanner.image_url}
          alt="Promotional Banner"
          className="w-full h-full object-cover object-center block"
          loading="lazy"
        />

        {/* Action Button positioned at the bottom right — same position for both English & Arabic */}
        {buttonLabel && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 z-20"
          >
            {hasLink ? (
              <Link
                href={fullBanner.link_url!}
                className="group/btn inline-flex items-center gap-2.5 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-[#f0d5c8] text-black font-medium transition-all duration-300 font-primary text-[11px] sm:text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 hover:shadow-[0_10px_25px_-5px_rgba(240,213,200,0.4)] cursor-pointer"
              >
                <span>{buttonLabel}</span>
                <svg
                  className="w-3.5 h-3.5 text-black transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2.5 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-white rounded-xl text-black font-medium font-primary text-[11px] sm:text-xs tracking-widest uppercase shadow-2xl">
                <span>{buttonLabel}</span>
              </span>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
