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
}

const ADMIN_NAV: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "My Store",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    subItems: [
      {
        name: "Hero Section",
        href: "/admin/hero",
      },
      {
        name: "Promotional Banners",
        href: "/admin/banners",
      },
      {
        name: "Featured Banner",
        href: "/admin/featuredbanner",
      },
      {
        name: "Full Banner",
        href: "/admin/full-banner",
      },
      {
        name: "Product Slider",
        href: "/admin/product-slider",
      },
      {
        name: "Badges",
        href: "/admin/badges",
      },
      {
        name: "Newsletter",
        href: "/admin/newsletter",
      },
      {
        name: "Vision Section",
        href: "/admin/vision",
      },
      {
        name: "About Section",
        href: "/admin/about",
      },
    ],
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    name: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    subItems: [
      {
        name: "Company Details",
        href: "/admin/settings",
      },
      {
        name: "Countries",
        href: "/admin/countries",
      },
    ],
  },
];

// Top Headbar Country Selector Button matching user design
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
      {/* Pill Button: [ 🌐 QATAR ∨ ] */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#ffffff" }}
        className="admin-country-btn flex items-center gap-2 px-3.5 py-1.5 bg-white border border-white hover:bg-neutral-100 rounded-full text-xs font-bold text-black transition-all cursor-pointer shadow-sm"
        aria-label="Select Country"
      >
        <svg style={{ color: "#000000" }} className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="#000000" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span style={{ color: "#000000" }} className="text-black uppercase tracking-wider text-xs">
          {selectedCountry?.name || "QATAR"}
        </span>
        <svg
          style={{ color: "#000000" }}
          className={`w-3.5 h-3.5 text-black transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="#000000"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-300 shadow-2xl z-50 py-1 overflow-hidden">
          <div className="px-3.5 py-2 border-b border-neutral-200 text-[10px] uppercase font-bold tracking-wider text-neutral-600 flex items-center justify-between font-mono bg-neutral-50">
            <span>Select Country</span>
            <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-mono font-bold">{countries.length} active</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {countries.map((c) => {
              const isSelected = selectedCountryCode.toUpperCase() === c.code.toUpperCase();
              return (
                <button
                  key={c.id || c.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountryCode(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-black text-white font-bold"
                      : "text-black hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 border flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 ${
                        isSelected
                          ? "bg-neutral-900 border-neutral-700 text-white"
                          : "bg-neutral-100 border-neutral-300 text-black"
                      }`}
                    >
                      {c.code}
                    </span>
                    <span className={`truncate uppercase font-bold text-xs ${isSelected ? "text-white" : "text-black"}`}>
                      {c.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Track open state for expandable menus (My Store, Settings)
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    "My Store": true,
    "Settings": true,
  });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Skip auth layout on login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = "ltr";
    }
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // If not logged in, redirect to admin login
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

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-secondary flex flex-col md:flex-row animate-pulse">
        {/* Sidebar skeleton */}
        <aside className="w-full md:w-64 h-full bg-neutral-900 border-r border-neutral-800 flex flex-col flex-shrink-0">
          <div className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
            <div className="h-6 w-28 bg-neutral-800 rounded" />
            <div className="h-5 w-12 bg-neutral-800 rounded" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-10 bg-neutral-800/80 rounded-lg" />
            <div className="h-10 bg-neutral-800/80 rounded-lg" />
            <div className="h-10 bg-neutral-800/80 rounded-lg" />
            <div className="h-10 bg-neutral-800/80 rounded-lg" />
          </div>
        </aside>
        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-neutral-800 bg-neutral-900/60 px-6 flex items-center justify-between">
            <div className="h-4 w-28 bg-neutral-800 rounded" />
            <div className="h-4 w-24 bg-neutral-800 rounded" />
          </header>
          <main className="p-8 space-y-6">
            <div className="h-6 w-48 bg-neutral-800 rounded" />
            <div className="h-32 bg-neutral-900 rounded-2xl border border-neutral-800" />
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

  return (
    <div dir="ltr" className="admin-theme h-screen overflow-hidden bg-white text-black font-secondary flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 h-auto md:h-full bg-white border-r border-neutral-200 flex flex-col flex-shrink-0 text-black">
        {/* Brand */}
        <div className="admin-sidebar-brand h-16 px-6 bg-black border-b border-neutral-900 flex items-center justify-center flex-shrink-0">
          <Link href="/admin" className="flex items-center justify-center">
            <div className="relative w-32 h-8">
              <Image
                src="/logo/logo.png"
                alt="Shaz Al Oud Logo"
                fill
                sizes="128px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <nav className="space-y-1.5">
            {ADMIN_NAV.map((item) => {
              if (item.subItems) {
                const isExpanded = openMenus[item.name] ?? false;
                const isAnySubActive = item.subItems.some((sub) => pathname === sub.href);

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        isAnySubActive
                          ? "bg-black text-white font-bold"
                          : "text-neutral-700 hover:text-black hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className={isAnySubActive ? "font-bold" : ""}>{item.name}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isAnySubActive ? "text-white" : "text-neutral-500"
                        } ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Sub-items List */}
                    {isExpanded && (
                      <div className="pl-6 space-y-1 py-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                                isSubActive
                                  ? "bg-black text-white font-bold"
                                  : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 ${
                                  isSubActive ? "bg-white" : "bg-neutral-400"
                                }`}
                              />
                              <span className={isSubActive ? "font-bold" : ""}>{sub.name}</span>
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
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white font-bold"
                      : "text-neutral-700 hover:text-black hover:bg-neutral-100"
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className={isActive ? "font-bold" : ""}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Signout */}
        <div className="p-4 border-t border-neutral-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Signed in as</p>
            <p className="text-sm font-bold text-neutral-900 truncate font-mono">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        <header className="h-16 flex-shrink-0 border-b border-neutral-800 bg-black px-6 flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-wider uppercase text-white font-mono">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-4">
            {/* Country Selector in Top Headbar */}
            <AdminCountrySelector />

            <Link
              href="/"
              target="_blank"
              className="text-xs text-white font-bold hover:text-amber-400 hover:underline flex items-center gap-1.5 transition-colors font-mono"
            >
              <span className="text-white font-bold">View Live Store</span>
              <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50 text-black">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
