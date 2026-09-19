"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminProvider, useAdminContext } from "@/context/AdminContext";

interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  subItems?: { name: string; href: string }[];
  group?: string;
}

const ADMIN_NAV: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    group: "MAIN",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Orders",
    href: "/admin/orders",
    group: "STORE",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    name: "Products",
    href: "/admin/products",
    group: "STORE",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: "Categories",
    href: "/admin/categories",
    group: "STORE",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "My Store",
    group: "STORE",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    subItems: [
      { name: "Hero Section", href: "/admin/hero" },
      { name: "Promotional Banners", href: "/admin/banners" },
      { name: "Featured Banner", href: "/admin/featuredbanner" },
      { name: "Full Banner", href: "/admin/full-banner" },
      { name: "Product Slider", href: "/admin/product-slider" },
      { name: "Badges", href: "/admin/badges" },
      { name: "Newsletter", href: "/admin/newsletter" },
      { name: "Vision Section", href: "/admin/vision" },
      { name: "About Section", href: "/admin/about" },
    ],
  },
  {
    name: "Company Details",
    href: "/admin/settings",
    group: "SETTINGS",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
      </svg>
    ),
  },
  {
    name: "Countries",
    href: "/admin/countries",
    group: "SETTINGS",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

// Country Selector
function AdminCountrySelector() {
  const { countries, selectedCountryCode, setSelectedCountryCode, selectedCountry } = useAdminContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!countries || countries.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="admin-country-btn flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-bold transition-all cursor-pointer"
        aria-label="Select Country"
      >
        {/* Flag image in pill */}
        <span className="flex-shrink-0 overflow-hidden inline-flex" style={{ width: "20px", height: "15px", borderRadius: "2px" }}>
          <img
            src={`https://flagcdn.com/w40/${(selectedCountry?.code || "qa").toLowerCase()}.png`}
            alt={selectedCountry?.code || "QA"}
            width={20}
            height={15}
            style={{ width: "20px", height: "15px", objectFit: "cover", borderRadius: "2px" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </span>
        <span className="uppercase tracking-wider text-xs font-bold">
          {selectedCountry?.name || "QATAR"}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{ backgroundColor: "var(--adm-card-bg)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
          className="absolute right-0 mt-2 w-52 border shadow-xl z-50 py-1 overflow-hidden animate-dropdown-luxury"
        >
          <div
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-muted)", backgroundColor: "var(--adm-thead-bg)" }}
            className="px-3 py-2 border-b text-[10px] uppercase font-bold tracking-wider flex items-center justify-between"
          >
            <span>Select Country</span>
            <span style={{ backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)" }} className="px-1.5 py-0.5 text-[9px] font-bold">
              {countries.length} active
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {countries.map((c) => {
              const isSelected = selectedCountryCode.toUpperCase() === c.code.toUpperCase();
              const flagCode = c.code.toLowerCase();
              return (
                <button
                  key={c.id || c.code}
                  type="button"
                  onClick={() => { setSelectedCountryCode(c.code); setIsOpen(false); }}
                  style={isSelected
                    ? { backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)" }
                    : { color: "var(--adm-text)" }
                  }
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                    !isSelected ? "hover:bg-[var(--adm-hover-bg)]" : ""
                  }`}
                >
                  {/* Flag image */}
                  <span className="flex-shrink-0 overflow-hidden inline-flex" style={{ width: "22px", height: "16px", borderRadius: "2px", border: "1px solid rgba(0,0,0,0.1)" }}>
                    <img
                      src={`https://flagcdn.com/w40/${flagCode}.png`}
                      alt={c.code}
                      width={22}
                      height={16}
                      style={{ width: "22px", height: "16px", objectFit: "cover", display: "block" }}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.style.display = "none";
                        const fallback = el.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <span
                      style={{
                        display: "none",
                        width: "22px", height: "16px",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.15)" : "var(--adm-hover-bg)",
                        fontSize: "8px", fontWeight: 700,
                        alignItems: "center", justifyContent: "center",
                        color: isSelected ? "var(--adm-active-text)" : "var(--adm-text)",
                      }}
                    >
                      {c.code}
                    </span>
                  </span>
                  <span className="truncate uppercase font-semibold text-xs">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useAdminContext();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    "My Store": false,
    "Settings": false,
  });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = "ltr";
    }
  }, []);

  useEffect(() => {
    if (isLoginPage) { setLoading(false); return; }
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        setUserEmail(session.user.email ?? "Admin");
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (isLoginPage) return <>{children}</>;

  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className={`admin-theme${isDark ? " admin-dark" : ""} min-h-screen flex flex-col md:flex-row animate-pulse`}
        style={{ backgroundColor: "var(--adm-bg)" }}>
        <aside style={{ backgroundColor: "var(--adm-sidebar-bg)", borderColor: "var(--adm-border)" }}
          className="w-full md:w-60 h-full border-r flex flex-col flex-shrink-0">
          <div style={{ backgroundColor: "var(--adm-logo-area-bg)" }} className="h-14 px-5 flex items-center" />
          <div className="p-4 space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ backgroundColor: "var(--adm-hover-bg)" }} className="h-9 rounded" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <div style={{ backgroundColor: "var(--adm-header-bg)", borderColor: "var(--adm-border)" }}
            className="h-14 border-b" />
          <main style={{ backgroundColor: "var(--adm-bg)" }} className="p-8 space-y-4 flex-1">
            <div style={{ backgroundColor: "var(--adm-hover-bg)" }} className="h-8 w-48 rounded" />
            <div style={{ backgroundColor: "var(--adm-card-bg)", borderColor: "var(--adm-border)" }}
              className="h-36 border rounded-lg" />
          </main>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/hero") return "My Store — Hero Section";
    if (pathname === "/admin/banners") return "My Store — Promotional Banners";
    if (pathname === "/admin/featuredbanner") return "My Store — Featured Banner";
    if (pathname === "/admin/full-banner") return "My Store — Full Banner";
    if (pathname === "/admin/product-slider") return "My Store — Product Slider";
    if (pathname === "/admin/badges") return "My Store — Badges";
    if (pathname === "/admin/newsletter") return "My Store — Newsletter";
    if (pathname === "/admin/vision") return "My Store — Vision Section";
    if (pathname === "/admin/about") return "My Store — About Section";
    if (pathname === "/admin/categories") return "Category Management";
    if (pathname === "/admin/products") return "Product Management";
    if (pathname === "/admin/orders") return "Order Management";
    if (pathname === "/admin/settings") return "Settings — Company Details";
    if (pathname === "/admin/countries") return "Settings — Countries";
    return "Admin Portal";
  };

  // Group nav items
  const groups: { label: string; items: NavItem[] }[] = [
    { label: "MAIN", items: ADMIN_NAV.filter(n => n.group === "MAIN") },
    { label: "STORE", items: ADMIN_NAV.filter(n => n.group === "STORE") },
    { label: "SETTINGS", items: ADMIN_NAV.filter(n => n.group === "SETTINGS") },
  ];

  // User initial
  const userInitial = (userEmail?.[0] || "A").toUpperCase();

  return (
    <div
      dir="ltr"
      className={`admin-theme${isDark ? " admin-dark" : ""} h-screen overflow-hidden flex flex-col md:flex-row`}
      style={{ backgroundColor: "var(--adm-bg)", color: "var(--adm-text)" }}
    >
      {/* ===== SIDEBAR ===== */}
      <aside
        className="w-full md:w-60 h-auto md:h-full flex flex-col flex-shrink-0 border-r"
        style={{ backgroundColor: "var(--adm-sidebar-bg)", borderColor: "var(--adm-border)" }}
      >
        {/* Brand / Logo */}
        <div
          className="admin-sidebar-brand h-14 px-5 flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--adm-logo-area-bg)", borderBottom: `1px solid var(--adm-border)` }}
        >
          <Link href="/admin" className="flex items-center justify-center">
            <div className="relative w-28 h-7">
              <Image src="/logo/logo.png" alt="Shaz Al Oud" fill sizes="112px" className="object-contain" priority />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <nav className="space-y-0.5">
            {groups.map((group, gi) => (
              <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
                {group.label !== "MAIN" && (
                  <p
                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: "var(--adm-section-label)" }}
                  >
                    {group.label}
                  </p>
                )}

                {group.items.map((item) => {
                  if (item.subItems) {
                    const isExpanded = openMenus[item.name] ?? false;
                    const isAnySubActive = item.subItems.some((sub) => pathname === sub.href);

                    return (
                      <div key={item.name} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.name)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-all cursor-pointer rounded`}
                          style={isAnySubActive
                            ? { backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)" }
                            : { color: "var(--adm-text-muted)" }
                          }
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded && (
                          <div className="pl-8 space-y-0.5 pb-1">
                            {item.subItems.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all rounded"
                                  style={isSubActive
                                    ? { backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)" }
                                    : { color: "var(--adm-text-muted)" }
                                  }
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: isSubActive ? "var(--adm-active-text)" : "var(--adm-border-strong)" }}
                                  />
                                  <span>{sub.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href!}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all rounded"
                      style={isActive
                        ? { backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)" }
                        : { color: "var(--adm-text-muted)" }
                      }
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* View Live Store + User info */}
        <div style={{ borderColor: "var(--adm-border)" }} className="border-t">
          {/* View Live Store */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all"
            style={{ color: "var(--adm-text-muted)" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>View Live Store</span>
          </Link>

          {/* User row */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)" }}
              >
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--adm-text)" }}>
                  Shaz Al Oud
                </p>
                <p className="text-[10px] truncate" style={{ color: "var(--adm-text-muted)" }}>
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex-shrink-0 p-1.5 rounded transition-all cursor-pointer"
              style={{ color: "#dc2626" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header
          className="h-14 flex-shrink-0 border-b flex items-center px-5 gap-4"
          style={{ backgroundColor: "var(--adm-header-bg)", borderColor: "var(--adm-border)" }}
        >
          {/* Search bar (center) */}
          <div className="flex-1 max-w-md">
            <div
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm"
              style={{
                backgroundColor: "var(--adm-hover-bg)",
                borderColor: "var(--adm-border)",
                color: "var(--adm-text-sub)",
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
              <span className="text-xs">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Country Selector */}
            <AdminCountrySelector />

            {/* Bell */}
            <button
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{ backgroundColor: "var(--adm-hover-bg)", color: "var(--adm-text-muted)" }}
              title="Notifications"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Dark / Light toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{ backgroundColor: "var(--adm-hover-bg)", color: "var(--adm-text-muted)" }}
            >
              {isDark ? (
                /* Sun icon */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                /* Moon icon */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* User Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer flex-shrink-0"
              style={{ backgroundColor: "var(--adm-active-bg)", color: "var(--adm-active-text)" }}
              title={userEmail || ""}
            >
              {userInitial}
            </div>
          </div>
        </header>

        {/* Main */}
        <main
          className="p-6 md:p-8 flex-1 overflow-y-auto"
          style={{ backgroundColor: "var(--adm-bg)", color: "var(--adm-text)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
