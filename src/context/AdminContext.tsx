"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Country } from "@/lib/countries";

export type { Country };

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  created_at: string;
}

export interface ProductVariantPrice {
  price: number;
  original_price?: number | null;
  is_in_stock?: boolean;
}

export interface ProductVariant {
  volume: string;
  original_price?: number | null;
  price: number;
  is_in_stock?: boolean;
  prices?: {
    [countryCode: string]: ProductVariantPrice;
  };
}

export interface Product {
  id: string;
  name: string;
  name_ar?: string | null;
  brand_name?: string | null;
  our_signature?: string | null;
  slug?: string | null;
  category_id?: string | null;
  category?: Category | null;
  price: number;
  original_price?: number | null;
  volume?: string | null;
  variants?: ProductVariant[];
  description?: string | null;
  image_url: string;
  images?: string[];
  is_featured: boolean;
  is_in_stock: boolean;
  display_order: number;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  main_heading: string;
  sub_heading?: string | null;
  background_image: string;
  button_text?: string | null;
  button_link?: string | null;
}

export interface HeroConfig {
  id: string;
  media_type: "image" | "video";
  video_url?: string | null;
}

interface AdminContextProps {
  categories: Category[];
  products: Product[];
  countries: Country[];
  selectedCountryCode: string;
  setSelectedCountryCode: (code: string) => void;
  selectedCountry: Country | null;
  heroSlides: HeroSlide[];
  heroConfig: HeroConfig | null;
  loadingCategories: boolean;
  loadingProducts: boolean;
  loadingCountries: boolean;
  loadingHeroSlides: boolean;
  loadingHeroConfig: boolean;
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCountries: () => Promise<void>;
  fetchHeroSlides: (selectId?: string | null) => Promise<void>;
  fetchHeroConfig: () => Promise<void>;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("QA");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingHeroSlides, setLoadingHeroSlides] = useState(false);
  const [loadingHeroConfig, setLoadingHeroConfig] = useState(false);

  const selectedCountry = React.useMemo(() => {
    if (countries.length === 0) return null;
    return (
      countries.find((c) => c.code.toUpperCase() === selectedCountryCode.toUpperCase()) ||
      countries.find((c) => c.code.toUpperCase() === "QA") ||
      countries[0] ||
      null
    );
  }, [countries, selectedCountryCode]);

  useEffect(() => {
    if (countries.length > 0) {
      const qatar = countries.find((c) => c.code.toUpperCase() === "QA" && c.is_active);
      const def = countries.find((c) => c.is_default && c.is_active);
      const initial = qatar?.code || def?.code || countries[0]?.code || "QA";
      setSelectedCountryCode((prev) =>
        countries.some((c) => c.code.toUpperCase() === prev.toUpperCase()) ? prev : initial
      );
    }
  }, [countries]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const res = await fetch("/api/admin/countries");
      const data = await res.json();
      if (data.countries && Array.isArray(data.countries)) {
        setCountries(data.countries);
      } else {
        setCountries([]);
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchHeroSlides = async () => {
    setLoadingHeroSlides(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("hero_section")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setHeroSlides(data || []);
    } catch (err) {
      console.error("Error fetching slides:", err);
    } finally {
      setLoadingHeroSlides(false);
    }
  };

  const fetchHeroConfig = async () => {
    setLoadingHeroConfig(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("hero_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setHeroConfig(data || null);
    } catch (err) {
      console.error("Error fetching hero config:", err);
    } finally {
      setLoadingHeroConfig(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCountries();
    fetchProducts();
    fetchHeroSlides();
    fetchHeroConfig();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        categories,
        products,
        countries,
        selectedCountryCode,
        setSelectedCountryCode,
        selectedCountry,
        heroSlides,
        heroConfig,
        loadingCategories,
        loadingProducts,
        loadingCountries,
        loadingHeroSlides,
        loadingHeroConfig,
        fetchCategories,
        fetchProducts,
        fetchCountries,
        fetchHeroSlides,
        fetchHeroConfig,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
};

