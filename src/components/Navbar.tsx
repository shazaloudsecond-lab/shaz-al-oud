"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";
import AccountModal from "@/components/AccountModal";

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { country, countries, setCountry, formatPrice, resolvePrice } = useCountry();
  const { language, isRTL, setLanguage, toggleLanguage, t, getProductName } = useLanguage();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isMobileCountryOpen, setIsMobileCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const { openCart, totalItems } = useCart();
  const { products } = useStore();

  const navLinks = useMemo(
    () => [
      { name: t("nav.home", "Home"), href: "/" },
      { name: t("nav.shop", "Shop"), href: "/shop" },
      { name: t("nav.about", "About Us"), href: "/about" },
      { name: t("nav.contact", "Contact Us"), href: "/contact" },
    ],
    [t]
  );

  const activeCountries = useMemo(
    () => countries.filter((c) => c.is_active),
    [countries]
  );

  // Close country dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        setIsCountryOpen(false);
        setIsMobileCountryOpen(false);
      }
    };
    if (isMenuOpen || isSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIsMobileCountryOpen(false);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isSearchOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchNameAr = p.name_ar?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category?.name?.toLowerCase().includes(q);
      const matchVol = p.volume?.toLowerCase().includes(q);
      return matchName || matchNameAr || matchDesc || matchCat || matchVol;
    });
  }, [searchQuery, products]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          !isHomePage || isScrolled
            ? "bg-black/95 backdrop-blur-md shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Start Section: Menu Toggle & Search */}
          <div className="flex items-center gap-5 sm:gap-7 flex-1">
            {/* Toggle Menu Button */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 text-white/90 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3.5" y1="6.5" x2="16.5" y2="6.5" />
                <line x1="3.5" y1="12" x2="20.5" y2="12" />
                <line x1="3.5" y1="17.5" x2="11.5" y2="17.5" />
              </svg>
            </button>

            {/* Search Button */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer group text-sm font-light tracking-wide"
            >
              <svg
                className="w-4 h-4 text-white/80 group-hover:text-white transition-colors flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <span className="hidden sm:inline-block text-white/70 group-hover:text-white transition-colors">
                {t("nav.search_placeholder", "Search")}
              </span>
            </button>
          </div>

          {/* Center Section: Logo */}
          <div className="flex items-center justify-center flex-shrink-0">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={160}
                height={50}
                priority
                className="h-9 md:h-11 w-auto object-contain brightness-0 invert"
              />
            </Link>
          </div>

          {/* End Section: Language Switcher, Country Selector, Shopping Bag & User Profile */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-4 flex-1">
            {/* Language Switcher Button (EN / العربية) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-semibold text-white/90  transition-all cursor-pointer"
              title={language === "en" ? "تبديل إلى العربية" : "Switch to English"}
              aria-label="Language Switcher"
            >
              {language === "en" ? "العربية" : "EN"}
            </button>

            {/* Country Selector Dropdown */}
            {activeCountries.length > 0 && (
              <div className="relative hidden sm:block" ref={countryDropdownRef}>
                <button
                  type="button"
                  aria-label="Select Country"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="p-1.5 flex items-center gap-1 text-white/90 hover:text-white transition-colors focus:outline-none cursor-pointer group"
                  title={country ? `${country.name} (${country.currency_code})` : t("nav.select_country", "Select Country")}
                >
                  <svg
                    className="w-5 h-5 text-white/90 group-hover:text-white transition-colors flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {country && (
                    <span className="font-mono text-xs text-white/80 group-hover:text-white transition-colors tracking-wide">
                      {country.code}
                    </span>
                  )}
                </button>

                {isCountryOpen && (
                  <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-auto px-5 bg-neutral-950/95 backdrop-blur-md shadow-2xl p-1.5 z-50 animate-fadeIn`}>
                    <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1">
                      {activeCountries.map((c) => {
                        const isSelected = c.code === country?.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountry(c);
                              setIsCountryOpen(false);
                            }}
                            className={`w-full text-center text-xs py-1 transition-all cursor-pointer font-medium ${
                              isSelected
                                ? " text-amber-400 font-semibold"
                                : "text-neutral-200 hover:text-white"
                            }`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shopping Bag */}
            <button
              type="button"
              aria-label={t("nav.cart", "Shopping Cart")}
              onClick={openCart}
              className="p-1.5 text-white/90 hover:text-white transition-colors focus:outline-none cursor-pointer relative"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className={`absolute -top-1 ${isRTL ? "-left-1" : "-right-1"} w-4 h-4 bg-[#f0d5c8] text-black text-[9px] font-bold rounded-full flex items-center justify-center font-mono shadow-sm`}>
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* User Account */}
            <button
              type="button"
              aria-label={t("nav.account", "User Account")}
              onClick={() => setIsAccountOpen(true)}
              className="hidden sm:block p-1.5 text-white/90 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer Navigation */}
      {/* Backdrop */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 bottom-0 ${isRTL ? "right-0 border-l" : "left-0 border-r"} w-80 max-w-[85vw] bg-neutral-950/98 backdrop-blur-xl text-white z-50 shadow-2xl flex flex-col justify-between border-neutral-800/80 transition-transform duration-300 ease-in-out transform ${
          isMenuOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between px-6 h-20">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={130}
                height={40}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label={t("common.close", "Close menu")}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-900"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Mobile Language Switcher */}
          <div className="px-6 pt-5 pb-2">
            <label className="text-[10px] uppercase font-semibold tracking-[0.18em] text-[#f0d5c8]/80 block mb-2">
              {t("nav.language", "Language")}
            </label>
            <div className="grid grid-cols-2 p-1 bg-neutral-900/90">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-white text-neutral-950 font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  language === "ar"
                    ? "bg-[#f0d5c8] text-neutral-950 font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Mobile Country Selector */}
          {activeCountries.length > 0 && (
            <div className="px-6 pt-2 pb-2">
              <label className="text-[10px] uppercase font-semibold tracking-[0.18em] text-[#f0d5c8]/80 block mb-2">
                {t("nav.select_country", "Select Country")}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMobileCountryOpen(!isMobileCountryOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-900/90 hover:border-neutral-700 text-xs font-medium text-neutral-200 transition-all cursor-pointer"
                >
                  <span className="font-semibold text-white tracking-wide">
                    {country?.name || activeCountries[0]?.name}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMobileCountryOpen ? "rotate-180 text-[#f0d5c8]" : "text-neutral-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMobileCountryOpen && (
                  <div className="mt-1.5 p-1 bg-neutral-900/98 shadow-2xl space-y-0.5 max-h-48 overflow-y-auto scrollbar-hide animate-fadeIn z-20">
                    {activeCountries.map((c) => {
                      const isSelected = c.code === (country?.code || "QA");
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountry(c);
                            setIsMobileCountryOpen(false);
                          }}
                          className={`w-full text-left rtl:text-right px-3 py-2 text-xs transition-all cursor-pointer font-medium ${
                            isSelected
                              ? "bg-white text-black font-semibold"
                              : "text-neutral-300 hover:text-white hover:bg-neutral-800/60"
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-6 py-4">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center justify-between py-3.5 text-sm sm:text-base font-light tracking-wide text-neutral-300 hover:text-white transition-all"
                  >
                    <span className="group-hover:text-[#f0d5c8] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-200">
                      {link.name}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-neutral-600 group-hover:text-[#f0d5c8] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all opacity-0 group-hover:opacity-100"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAccountOpen(true);
                  }}
                  className="w-full group flex items-center justify-between py-3.5 text-sm sm:text-base font-light tracking-wide text-neutral-300 hover:text-white transition-all cursor-pointer text-left rtl:text-right"
                >
                  <span className="group-hover:text-[#f0d5c8] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-200">
                    {t("nav.account", "Account")}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-neutral-600 group-hover:text-[#f0d5c8] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all opacity-0 group-hover:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-neutral-900 text-[11px] text-neutral-500 font-mono tracking-wider text-center">
          <p className="uppercase">© {new Date().getFullYear()} Shaz Al Oud</p>
        </div>
      </aside>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md animate-fadeIn">
          {/* Top Search Bar Header */}
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6 pb-4 border-b border-neutral-800 flex items-center gap-4">
            <svg
              className="w-5 h-5 text-neutral-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("nav.search_placeholder", "Search fragrances, oud, collections...")}
              className="flex-1 bg-transparent text-white placeholder-neutral-500 text-base sm:text-lg focus:outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-neutral-500 hover:text-white transition-colors text-xs uppercase cursor-pointer"
              >
                {t("common.cancel", "Clear")}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              aria-label={t("common.close", "Close search")}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search Results Area */}
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 overflow-y-auto scrollbar-hide">
            {!searchQuery.trim() ? (
              <div className="py-16 text-center text-neutral-500 space-y-2">
                <p className="text-sm uppercase tracking-widest font-mono">{t("nav.search_placeholder", "Type to search")}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 space-y-2">
                <p className="text-sm font-medium text-neutral-300">{t("products.no_products", "No fragrances found")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-4 font-mono">
                  {searchResults.length} {t("common.items", "Results")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-4 p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl hover:border-neutral-700 hover:bg-neutral-900 transition-all group cursor-pointer"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-[10px] text-neutral-600">No img</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white group-hover:text-[#f0d5c8] transition-colors truncate">
                          {getProductName(product)}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {product.category?.name && (
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                              {product.category.name}
                            </span>
                          )}
                          {product.volume && (
                            <span className="text-[10px] text-neutral-500 font-mono">
                              • {product.volume}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[#dfc3b4] mt-1 font-mono">
                          {formatPrice(resolvePrice(product).price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </>
  );
}
