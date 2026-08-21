"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useStore } from "@/context/StoreContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, tDynamic, isRTL } = useLanguage();
  const { categories, companyDetails } = useStore();

  // Mobile Accordion state: track open state per section key
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const footerLinks = {
    shop: [
      { id: "shop-all", name: t("nav.collection", "All Fragrances"), href: "/shop" },
      ...(categories && categories.length > 0
        ? categories.slice(0, 3).map((cat) => ({
            id: `cat-${cat.id}`,
            name: tDynamic(cat.name),
            href: `/shop?category=${encodeURIComponent(cat.name)}`,
          }))
        : []),
    ],
    about: [
      { id: "about-story", name: t("footer.our_story", "Our Story"), href: "/about" },
      { id: "about-vision", name: t("footer.craftsmanship", "Vision & Craft"), href: "/#vision" },
    ],
    help: [
      { id: "help-account", name: t("nav.account", "My Account"), href: "/account" },
      { id: "help-contact", name: t("nav.contact", "Contact Us"), href: "/contact" },
      { id: "help-shipping", name: t("footer.shipping_returns", "Shipping & Delivery"), href: "/#badges" },
    ],
  };

  const hasCompanyDetails =
    Boolean(companyDetails?.address) ||
    Boolean(companyDetails?.phone) ||
    Boolean(companyDetails?.email) ||
    Boolean(companyDetails?.name);

  return (
    <footer className="w-full bg-black text-white border-t border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-10 pb-10">
        {/* Main Content Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            hasCompanyDetails ? "md:grid-cols-12" : "md:grid-cols-5"
          } gap-8 sm:gap-10 lg:gap-12 pb-5`}
        >
          {/* Brand Column with Logo & Social Media Icons (Left Side) */}
          <div
            className={`${
              hasCompanyDetails
                ? "col-span-1 sm:col-span-2 md:col-span-3"
                : "col-span-1 sm:col-span-2 md:col-span-2"
            } flex flex-col justify-between space-y-6`}
          >
            <div>
              <Link href="/" className="inline-block group w-fit">
                <Image
                  src="/logo/logo.png"
                  alt="Shaz Al Oud"
                  width={160}
                  height={50}
                  className="h-10 sm:h-12 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed font-secondary font-light">
                {companyDetails?.tagline
                  ? tDynamic(companyDetails.tagline)
                  : t(
                      "footer.tagline",
                      "Exquisite luxury fragrances and authentic pure oud crafted for timeless elegance."
                    )}
              </p>
            </div>

            {/* Social Media Icons Box */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MOBILE ACCORDION (Visible on Mobile screens only: sm:hidden) */}
          {/* ======================================================== */}
          <div className="block sm:hidden col-span-1 divide-y divide-neutral-900 border-y border-neutral-900 mt-2">
            {/* SHOP Accordion */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("shop")}
                className="w-full py-4 flex items-center justify-between text-start text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8] focus:outline-none cursor-pointer"
              >
                <span>{t("nav.collection", "SHOP")}</span>
                <svg
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${
                    openSection === "shop" ? "rotate-180 text-white" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === "shop" && (
                <ul className="pb-4 space-y-2.5 pl-1 animate-fadeIn">
                  {footerLinks.shop.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-xs text-neutral-400 hover:text-white transition-colors block py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ABOUT Accordion */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("about")}
                className="w-full py-4 flex items-center justify-between text-start text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8] focus:outline-none cursor-pointer"
              >
                <span>{t("nav.about", "ABOUT US")}</span>
                <svg
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${
                    openSection === "about" ? "rotate-180 text-white" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === "about" && (
                <ul className="pb-4 space-y-2.5 pl-1 animate-fadeIn">
                  {footerLinks.about.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-xs text-neutral-400 hover:text-white transition-colors block py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CUSTOMER CARE Accordion */}
            <div>
              <button
                type="button"
                onClick={() => toggleAccordion("help")}
                className="w-full py-4 flex items-center justify-between text-start text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8] focus:outline-none cursor-pointer"
              >
                <span>{t("footer.customer_care", "CUSTOMER CARE")}</span>
                <svg
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${
                    openSection === "help" ? "rotate-180 text-white" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === "help" && (
                <ul className="pb-4 space-y-2.5 pl-1 animate-fadeIn">
                  {footerLinks.help.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-xs text-neutral-400 hover:text-white transition-colors block py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* LOCATION Accordion */}
            {hasCompanyDetails && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion("location")}
                  className="w-full py-4 flex items-center justify-between text-start text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8] focus:outline-none cursor-pointer"
                >
                  <span>{t("footer.store_location", "LOCATION")}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${
                      openSection === "location" ? "rotate-180 text-white" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === "location" && (
                  <div className="pb-4 space-y-3 pl-1 text-xs text-neutral-400 animate-fadeIn">
                    {companyDetails?.name && (
                      <p className="font-semibold text-neutral-200 text-xs">
                        {tDynamic(companyDetails.name)}
                      </p>
                    )}

                    {companyDetails?.address && (
                      <div className="flex items-start gap-2.5 leading-relaxed">
                        <svg
                          className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="break-words">{tDynamic(companyDetails.address)}</span>
                      </div>
                    )}

                    {companyDetails?.phone && (
                      <div className="flex items-center gap-2.5">
                        <svg
                          className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <a
                          href={`tel:${companyDetails.phone.replace(/\s+/g, "")}`}
                          dir="ltr"
                          className="hover:text-white transition-colors whitespace-nowrap inline-block"
                        >
                          {companyDetails.phone}
                        </a>
                      </div>
                    )}

                    {companyDetails?.email && (
                      <div className="flex items-center gap-2.5">
                        <svg
                          className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <a
                          href={`mailto:${companyDetails.email}`}
                          className="hover:text-white transition-colors whitespace-nowrap"
                        >
                          {companyDetails.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* DESKTOP COLUMNS (Visible on Tablet and Desktop: hidden sm:block) */}
          {/* ======================================================== */}

          {/* SHOP Column (Desktop) */}
          <div className={`hidden sm:block ${hasCompanyDetails ? "col-span-1 md:col-span-2" : "col-span-1"} space-y-4`}>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8]">
              {t("nav.collection", "SHOP")}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ABOUT Column (Desktop) */}
          <div className={`hidden sm:block ${hasCompanyDetails ? "col-span-1 md:col-span-2" : "col-span-1"} space-y-4`}>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8]">
              {t("nav.about", "ABOUT US")}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* HELP Column (Desktop) */}
          <div className={`hidden sm:block ${hasCompanyDetails ? "col-span-1 md:col-span-2" : "col-span-1"} space-y-4`}>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8]">
              {t("footer.customer_care", "CUSTOMER CARE")}
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.help.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* STORE LOCATION / COMPANY DETAILS (Desktop) */}
          {hasCompanyDetails && (
            <div className="hidden sm:block col-span-1 sm:col-span-2 md:col-span-3 space-y-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f0d5c8]">
                {t("footer.store_location", "LOCATION")}
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-neutral-400">
                {companyDetails?.name && (
                  <p className="font-semibold text-neutral-200 text-sm">
                    {tDynamic(companyDetails.name)}
                  </p>
                )}

                {companyDetails?.address && (
                  <div className="flex items-start gap-2.5 leading-relaxed">
                    <svg
                      className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="break-words">{tDynamic(companyDetails.address)}</span>
                  </div>
                )}

                {companyDetails?.phone && (
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-neutral-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a
                      href={`tel:${companyDetails.phone.replace(/\s+/g, "")}`}
                      dir="ltr"
                      className="hover:text-white transition-colors whitespace-nowrap inline-block"
                    >
                      {companyDetails.phone}
                    </a>
                  </div>
                )}

                {companyDetails?.email && (
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-neutral-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${companyDetails.email}`}
                      className="hover:text-white transition-colors whitespace-nowrap"
                    >
                      {companyDetails.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar — Centered Copyright */}
        <div className="border-t border-neutral-900 pt-8 flex items-center justify-center text-[11px] text-neutral-500 font-mono">
          <p className="uppercase tracking-wider text-center">
            © {currentYear} SHAZ AL OUD. {t("footer.all_rights", "ALL RIGHTS RESERVED.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
