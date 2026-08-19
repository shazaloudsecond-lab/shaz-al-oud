"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";

export default function NewsletterSection() {
  const { newsletterConfig, loadingStore } = useStore();
  const { t, tDynamic } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (loadingStore) {
    return (
      <section className="w-full bg-black py-16 sm:py-10 px-4 sm:px-6 lg:px-12 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="w-full aspect-[4/3] bg-neutral-900 rounded-2xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-neutral-900 rounded animate-pulse" />
            <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-neutral-900 rounded animate-pulse" />
            <div className="h-12 w-full bg-neutral-900 rounded-xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // If no config exists, or section is inactive, or no image/heading provided, don't show mock data
  if (
    !newsletterConfig ||
    !newsletterConfig.is_active ||
    (!newsletterConfig.image_url && !newsletterConfig.heading)
  ) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus({ type: "error", message: t("newsletter.placeholder", "Please enter your email address.") });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe. Please try again.");
      }

      setStatus({
        type: "success",
        message: data.message || t("newsletter.success", "Thank you for subscribing to our newsletter!"),
      });
      setEmail("");
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || t("common.error", "Something went wrong. Please try again later."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-black py-16 sm:pt-10 sm:pb-24px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left Side — Image */}
        {newsletterConfig.image_url ? (
          <div className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] overflow-hidden shadow-2xl bg-neutral-900 relative group">
            <img
              src={newsletterConfig.image_url}
              alt={newsletterConfig.heading || "Newsletter"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
            No Image Configured
          </div>
        )}

        {/* Right Side — Heading, Subheading & Form */}
        <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
          <div className="space-y-3">
            {newsletterConfig.heading && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-primary text-white leading-tight tracking-tight">
                {tDynamic(newsletterConfig.heading)}
              </h2>
            )}
            {newsletterConfig.subheading && (
              <p className="text-sm sm:text-base font-secondary text-neutral-400 leading-relaxed">
                {tDynamic(newsletterConfig.subheading)}
              </p>
            )}
          </div>

          {/* Subscription Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletter.placeholder", "Enter your email address")}
                disabled={submitting}
                required
                className="flex-1 px-4 py-3.5 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:bg-neutral-950 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 bg-white hover:bg-[#f0d5c8] disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t("common.loading", "Subscribing...")}
                  </span>
                ) : (
                  t("newsletter.button", "Subscribe")
                )}
              </button>
            </div>

            {/* Status Alert */}
            {status && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                  status.type === "success"
                    ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
                    : "bg-red-950/50 border-red-800/80 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {status.type === "success" ? (
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{tDynamic(status.message)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus(null)}
                  className="text-neutral-400 hover:text-white text-xs ml-3 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
