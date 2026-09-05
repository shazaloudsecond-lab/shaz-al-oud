"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import PreIntro from "./PreIntro";

const SESSION_STORAGE_KEY = "shaz_preintro_shown";

export default function PreIntroWrapper() {
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      // URL override for easy previewing anytime (e.g. localhost:3000/?intro=true)
      const params = new URLSearchParams(window.location.search);
      if (params.get("intro") === "true") {
        setShowIntro(true);
        return;
      }

      // Check if already displayed in this browser session
      const alreadyShown = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (alreadyShown) {
        setShowIntro(false);
        return;
      }

      // First time opening the website in this session: display pre-intro!
      setShowIntro(true);
    } catch {
      setShowIntro(false);
    }
  }, []);

  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch {}
    setShowIntro(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {showIntro && <PreIntro onFinish={handleFinish} />}
    </AnimatePresence>
  );
}
