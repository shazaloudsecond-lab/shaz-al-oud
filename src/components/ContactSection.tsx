"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCountry } from "@/context/CountryContext";

export default function ContactSection() {
  const { companyDetails } = useStore();
  const { t, tDynamic, isRTL } = useLanguage();
  const { country } = useCountry();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const whatsappPhone =
    country?.whatsapp_number ||
    companyDetails?.phone?.replace(/\s+/g, "") ||
    "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      // If whatsapp is configured, option to trigger inquiry via WhatsApp
      if (whatsappPhone) {
        const text = encodeURIComponent(
          `*New Inquiry — Shaz Al Oud*\n\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone || "N/A"}\n\n*Message:* ${message}`
        );
        const cleanPhone = whatsappPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");
        window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
      }

      setStatus({
        type: "success",
        message: t("contact.success", "Thank you for reaching out! We will get back to you shortly."),
      });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
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
    <section id="contact" className="w-full bg-black py-10 sm:py-16 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Header (Left-aligned like Account page) */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold uppercase tracking-wider text-white font-primary">
            {t("contact.heading", "Contact Us")}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-secondary">
            {companyDetails?.tagline
              ? tDynamic(companyDetails.tagline)
              : t(
                "contact.subtitle",
                "Have a question about our bespoke fragrances or need assistance? Reach out to our concierge."
              )}
          </p>
        </div>

        {/* 2-Column Grid: Company Information & Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Company Details (Second on mobile, First on Desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
            <div className="sm:bg-neutral-950 rounded-none sm:p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-mono border-b border-neutral-900 pb-3">
                {companyDetails?.name ? tDynamic(companyDetails.name) : "Shaz Al Oud"}
              </h3>

              {/* Detail Items */}
              <div className="space-y-5 text-xs sm:text-sm">
                {/* Physical Store Address */}
                {companyDetails?.address && (
                  <div className="flex items-start gap-3.5 text-neutral-300">
                    <div className="w-9 h-9  rounded-none flex items-center justify-center text-[#f0d5c8] flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="space-y-0.5 pt-0.5">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                        {t("footer.store_location", "Store Location")}
                      </p>
                      <p className="font-medium text-neutral-200 leading-relaxed">
                        {tDynamic(companyDetails.address)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Phone */}
                {companyDetails?.phone && (
                  <div className="flex items-start gap-3.5 text-neutral-300">
                    <div className="w-9 h-9  rounded-none flex items-center justify-center text-[#f0d5c8] flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="space-y-0.5 pt-0.5">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                        {t("contact.phone", "Phone / Direct Line")}
                      </p>
                      <a
                        href={`tel:${companyDetails.phone.replace(/\s+/g, "")}`}
                        dir="ltr"
                        className="font-mono text-neutral-200 hover:text-white transition-colors inline-block"
                      >
                        {companyDetails.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Support Email */}
                {companyDetails?.email && (
                  <div className="flex items-start gap-3.5 text-neutral-300">
                    <div className="w-9 h-9  rounded-none flex items-center justify-center text-[#f0d5c8] flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="space-y-0.5 pt-0.5 min-w-0">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                        {t("contact.email", "Email")}
                      </p>
                      <a
                        href={`mailto:${companyDetails.email}`}
                        className="text-neutral-200 hover:text-white transition-colors block truncate font-mono"
                      >
                        {companyDetails.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send Message Form (First on mobile, Second on Desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="sm:bg-neutral-950 rounded-none sm:p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="border-b border-neutral-900 pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-mono">
                  {t("contact.form_title", "Send Us a Message")}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {t("contact.form_desc", "Fill out the form below and we will respond promptly.")}
                </p>
              </div>

              {/* Status Message */}
              {status && (
                <div
                  className={`p-3.5 rounded-none text-xs flex items-center justify-between border ${status.type === "success"
                    ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
                    : "bg-red-950/50 border-red-800 text-red-300"
                    }`}
                >
                  <span>{status.message}</span>
                  <button
                    type="button"
                    onClick={() => setStatus(null)}
                    className="text-neutral-400 hover:text-white text-xs ml-3 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      {t("contact.full_name", "Full Name")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("contact.name_placeholder", "Your Name")}
                      className="w-full px-4 py-3 bg-neutral-900 rounded-none text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#f0d5c8] transition-colors"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      {t("contact.email", "Email Address")} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("contact.email_placeholder", "name@example.com")}
                      className="w-full px-4 py-3 bg-neutral-900 rounded-none text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#f0d5c8] transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {t("contact.whatsapp_phone", "Phone / WhatsApp Number")}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("contact.phone_placeholder", "+974 5555 1234")}
                    dir="ltr"
                    className="w-full px-4 py-3 bg-neutral-900 rounded-none text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#f0d5c8] transition-colors font-mono"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {t("contact.message", "Your Message")} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("contact.message_placeholder", "How can we assist you with our bespoke fragrance collection?")}
                    className="w-full px-4 py-3 bg-neutral-900 rounded-none text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#f0d5c8] transition-colors resize-none"
                  />
                </div>

                {/* Submit Button (No border radius) */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] text-black font-semibold text-xs uppercase tracking-widest transition-all rounded-none shadow-md disabled:opacity-50 cursor-pointer font-mono mt-2 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>{t("common.loading", "Sending...")}</span>
                  ) : (
                    <span>{t("contact.send_button", "Send Message")}</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
