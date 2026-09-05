"use client";

import Link from "next/link";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { heroSlides: slides, heroConfig, loadingHero: loading, companyDetails } = useStore();
  const { tDynamic, isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const instagramUrl = companyDetails?.instagram || "https://instagram.com";
  const youtubeUrl = companyDetails?.youtube || "https://youtube.com";
  const tiktokUrl = companyDetails?.tiktok || "https://tiktok.com";
  const facebookUrl = companyDetails?.facebook || "https://facebook.com";

  const renderSocialLinks = () => (
    <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-black flex items-center justify-center hover:scale-110 hover:bg-[#dfc3b4] transition-all duration-200 shadow-md"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </a>
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-black flex items-center justify-center hover:scale-110 hover:bg-[#dfc3b4] transition-all duration-200 shadow-md"
      >
        <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
          <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
        </svg>
      </a>
      <a
        href={tiktokUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-black flex items-center justify-center hover:scale-110 hover:bg-[#dfc3b4] transition-all duration-200 shadow-md"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-black flex items-center justify-center hover:scale-110 hover:bg-[#dfc3b4] transition-all duration-200 shadow-md"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.52-.14-2.71-.14-2.72 0-4.64 1.64-4.64 4.75v2.75H7v4h3.15V22h3.85v-8.5z" />
        </svg>
      </a>
    </div>
  );

  const isVideoMode = heroConfig?.media_type === "video";

  // Next slide function
  const nextSlide = useCallback(() => {
    if (slides.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  // Autoplay carousel timer — only in image mode
  useEffect(() => {
    if (isVideoMode || slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVideoMode, slides.length, nextSlide, currentIndex]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="relative w-full h-[78dvh] min-h-[520px] sm:h-[100dvh] sm:min-h-[100dvh] flex items-end sm:items-center justify-start overflow-hidden bg-black text-white font-primary select-none">
        <div className="absolute inset-0 bg-neutral-950 animate-pulse" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start text-left pb-24 sm:pb-20 space-y-4">
          <div className="h-10 sm:h-14 w-64 sm:w-96 bg-neutral-900 rounded-2xl animate-pulse" />
          <div className="hidden sm:block h-4 sm:h-5 w-48 sm:w-72 bg-neutral-900 rounded-lg animate-pulse" />
        </div>
      </section>
    );
  }

  // Nothing to show
  if (slides.length === 0) return null;

  const activeSlide = slides[currentIndex] || slides[0];

  // ─── VIDEO MODE ────────────────────────────────────────────────────
  if (isVideoMode) {
    const videoSrc = heroConfig?.video_url || "";

    return (
      <section className="relative w-full h-[78dvh] min-h-[520px] sm:h-[100dvh] sm:min-h-[100dvh] flex items-end sm:items-center justify-start overflow-hidden bg-black text-white font-primary select-none">
        {/* Fullscreen video background */}
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "100%",
              minHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "cover",
              objectPosition: "center center",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-950" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/50" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start text-start pb-24 sm:pb-20">
          <div className="max-w-lg md:max-w-xl space-y-3 sm:space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-medium uppercase tracking-wide md:tracking-wider font-primary leading-tight text-[#f0d5c8] drop-shadow-md break-words"
            >
              {tDynamic(activeSlide.main_heading)}
            </motion.h1>

            {activeSlide.sub_heading && (
              <motion.p
                initial={{ opacity: 0, y: 20, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="hidden sm:block text-xs sm:text-sm text-[#dfc3b4]/85 font-light tracking-wide sm:tracking-wider uppercase leading-relaxed font-primary max-w-md break-words"
              >
                {tDynamic(activeSlide.sub_heading)}
              </motion.p>
            )}
          </div>
        </div>

        {/* Bottom Bar: Social Media Icons (Start) & Action Button (End) aligned with Navbar max-w-7xl */}
        <div className="absolute bottom-8 sm:bottom-10 inset-x-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between pointer-events-auto">
            {/* Social Media Links */}
            {renderSocialLinks()}

            {/* Action Button */}
            {activeSlide.button_text && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="sm:ms-auto"
              >
                <Link
                  href={activeSlide.button_link && activeSlide.button_link !== "#" ? activeSlide.button_link : "/shop"}
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-[#f0d5c8] text-black font-medium transition-all duration-300 font-primary text-xs tracking-widest uppercase shadow-2xl hover:scale-105"
                >
                  <span>{tDynamic(activeSlide.button_text)}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-black ${isRTL ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"} transition-transform duration-300`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── IMAGE CAROUSEL MODE ──────────────────────────────────────────
  return (
    <section className="relative w-full h-[78dvh] min-h-[520px] sm:h-[100dvh] sm:min-h-[100dvh] flex items-end sm:items-center justify-start overflow-hidden bg-black text-white font-primary select-none">
      {/* Background Image Smooth Crossfade & Subtle Zoom Animation */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${activeSlide.id || currentIndex}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="absolute inset-0 bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: `url(${activeSlide.background_image})` }}
        >
          {/* Ambient Lighting Gradient Overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/50" /> */}
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start text-start pb-24 sm:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeSlide.id || currentIndex}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-lg md:max-w-xl space-y-3 sm:space-y-4"
          >
            {/* Main Heading */}
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                exit: { opacity: 0, y: -20, filter: "blur(4px)" },
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-medium uppercase tracking-wide md:tracking-wider font-primary leading-tight text-[#f0d5c8] drop-shadow-md break-words"
            >
              {tDynamic(activeSlide.main_heading)}
            </motion.h1>

            {/* Subheading */}
            {activeSlide.sub_heading && (
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(3px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                  exit: { opacity: 0, y: -12, filter: "blur(3px)" },
                }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="hidden sm:block text-xs sm:text-sm text-[#dfc3b4]/85 font-light tracking-wide sm:tracking-wider uppercase leading-relaxed font-primary max-w-md break-words"
              >
                {tDynamic(activeSlide.sub_heading)}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar: Social Media Icons (Start) & Action Button (End) aligned with Navbar max-w-7xl */}
      <div className="absolute bottom-8 sm:bottom-10 inset-x-0 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between pointer-events-auto">
          {/* Social Media Links */}
          {renderSocialLinks()}

          {/* Action Button */}
          {activeSlide.button_text && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`btn-${activeSlide.id || currentIndex}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="sm:ms-auto"
              >
                <Link
                  href={activeSlide.button_link && activeSlide.button_link !== "#" ? activeSlide.button_link : "/shop"}
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-[#f0d5c8] text-black font-medium transition-all duration-300 font-primary text-xs tracking-widest uppercase shadow-2xl hover:scale-105"
                >
                  <span>{tDynamic(activeSlide.button_text)}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-black ${isRTL ? "group-hover:-translate-x-1 rotate-180" : "group-hover:translate-x-1"} transition-transform duration-300`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
