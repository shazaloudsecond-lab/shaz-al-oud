"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface PreIntroProps {
  onFinish: () => void;
}

export default function PreIntro({ onFinish }: PreIntroProps) {
  useEffect(() => {
    // Lock body scrolling while intro is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-finish after 2.5s
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onClick={onFinish}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black select-none overflow-hidden"
      aria-label="Pre-Intro Splash Screen"
    >
      {/* Luxury ambient gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.12) 0%, rgba(0, 0, 0, 0) 65%)",
        }}
      />

      {/* Centered Brand Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {/* Animated Brand Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-40 sm:w-50 md:w-55 h-24 sm:h-28 md:h-32 flex items-center justify-center"
        >
          <Image
            src="/logo/logo-without-bg.png"
            alt="Shaz Al Oud Logo"
            width={320}
            height={100}
            priority
            className="w-full h-auto object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.25)]"
          />
        </motion.div>

        {/* Delicate expanding accent line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.7 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-28 sm:w-36 origin-center"
        />

        {/* Brand Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.65, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: "easeOut" }}
          className="mt-3 text-[10px] sm:text-xs tracking-[0.35em] text-white/70 uppercase font-light"
        >
          Haute Parfumerie
        </motion.p>
      </div>
    </motion.div>
  );
}
