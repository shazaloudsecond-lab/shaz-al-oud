"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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

export interface PromoBanner {
  id: string;
  heading?: string | null;
  left_image_url: string;
  left_link?: string | null;
  right_image_url: string;
  right_link?: string | null;
  is_active: boolean;
}

export interface Badge {
  id: string;
  position: number;
  icon_url?: string | null;
  heading?: string | null;
  description?: string | null;
}

export interface FeaturedBanner {
  id: string;
  image_url: string;
  heading?: string | null;
  subheading?: string | null;
  is_active: boolean;
}

export interface NewsletterConfig {
  id: string;
  image_url?: string | null;
  heading?: string | null;
  subheading?: string | null;
  is_active: boolean;
}

export interface VisionSection {
  id: string;
  image_url?: string | null;
  heading?: string | null;
  description?: string | null;
  is_active: boolean;
}

export interface AboutSection {
  id: string;
  image_url?: string | null;
  heading?: string | null;
  subheading?: string | null;
  description?: string | null;
  story?: string | null;
  is_active: boolean;
}

export interface AboutAccordionItem {
  id?: string;
  title: string;
  content: string;
}

export interface AboutSectionThree {
  id: string;
  image_url?: string | null;
  heading?: string | null;
  subheading?: string | null;
  bg_color?: string | null;
  items?: AboutAccordionItem[];
  is_active: boolean;
}

export interface FullBanner {
  id: string;
  image_url: string;
  link_url?: string | null;
  button_text?: string | null;
  link_type?: string | null;
  selected_id?: string | null;
  is_active: boolean;
}

export interface ProductSliderConfig {
  id: string;
  heading: string;
  is_active: boolean;
}

export interface ProductSliderItem {
  id: string;
  product_id: string;
  display_order: number;
  bg_color?: string | null;
  product?: Product;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
}

export interface ProductVariantPrice {
  price: number;
  original_price?: number | null;
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
  is_featured?: boolean;
  is_in_stock?: boolean;
  display_order?: number;
  created_at?: string;
}

export interface CompanyDetails {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  tagline?: string;
}

interface StoreContextProps {
  heroSlides: HeroSlide[];
  heroConfig: HeroConfig | null;
  promoBanner: PromoBanner | null;
  featuredBanner: FeaturedBanner | null;
  fullBanner: FullBanner | null;
  productSliderConfig: ProductSliderConfig | null;
  productSliderItems: ProductSliderItem[];
  newsletterConfig: NewsletterConfig | null;
  visionSection: VisionSection | null;
  aboutSection: AboutSection | null;
  aboutSectionTwo: AboutSection | null;
  aboutSectionThree: AboutSectionThree | null;
  aboutSectionFour: AboutSection | null;
  badges: Badge[];
  categories: Category[];
  products: Product[];
  companyDetails: CompanyDetails | null;
  loadingHero: boolean;
  loadingStore: boolean;
  getProductById: (id: string) => Promise<Product | null>;
  refreshStore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null);
  const [featuredBanner, setFeaturedBanner] = useState<FeaturedBanner | null>(null);
  const [fullBanner, setFullBanner] = useState<FullBanner | null>(null);
  const [productSliderConfig, setProductSliderConfig] = useState<ProductSliderConfig | null>(null);
  const [productSliderItems, setProductSliderItems] = useState<ProductSliderItem[]>([]);
  const [newsletterConfig, setNewsletterConfig] = useState<NewsletterConfig | null>(null);
  const [visionSection, setVisionSection] = useState<VisionSection | null>(null);
  const [aboutSection, setAboutSection] = useState<AboutSection | null>(null);
  const [aboutSectionTwo, setAboutSectionTwo] = useState<AboutSection | null>(null);
  const [aboutSectionThree, setAboutSectionThree] = useState<AboutSectionThree | null>(null);
  const [aboutSectionFour, setAboutSectionFour] = useState<AboutSection | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingStore, setLoadingStore] = useState(true);

  const fetchHero = useCallback(async () => {
    try {
      const supabase = createClient();
      const [slidesResult, configResult] = await Promise.all([
        supabase
          .from("hero_section")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("hero_config")
          .select("*")
          .limit(1)
          .maybeSingle(),
      ]);
      if (!slidesResult.error && slidesResult.data) setHeroSlides(slidesResult.data);
      if (!configResult.error && configResult.data) setHeroConfig(configResult.data);
    } catch (err) {
      console.error("Error fetching hero:", err);
    } finally {
      setLoadingHero(false);
    }
  }, []);

  const fetchStore = useCallback(async () => {
    try {
      const supabase = createClient();
      const [catResult, prodResult, bannerResult, badgeResult, featuredResult, sliderConfigResult, sliderItemsResult, newsletterResult, visionResult, fullBannerResult, settingsResult, aboutResult, aboutTwoResult, aboutThreeResult, aboutFourResult] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .order("display_order", { ascending: true })
          .order("name", { ascending: true }),
        supabase
          .from("products")
          .select(`*, category:categories(id, name, slug)`)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase
          .from("promo_banners")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("badges")
          .select("*")
          .order("position", { ascending: true }),
        supabase
          .from("featured_banner")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("product_slider_config")
          .select("*")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("product_slider_items")
          .select(`*, product:products(*)`)
          .order("display_order", { ascending: true }),
        supabase
          .from("newsletter_config")
          .select("*")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("vision_section")
          .select("*")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("full_banner")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("admin_settings")
          .select("key, value"),
        supabase
          .from("about_section")
          .select("*")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("about_section_two")
          .select("*")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("about_section_three")
          .select("*")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("about_section_four")
          .select("*")
          .limit(1)
          .maybeSingle(),
      ]);

      if (!catResult.error && catResult.data) setCategories(catResult.data);
      if (!prodResult.error && prodResult.data) setProducts(prodResult.data);
      if (!bannerResult.error && bannerResult.data) setPromoBanner(bannerResult.data);
      if (!badgeResult.error && badgeResult.data) setBadges(badgeResult.data);
      if (!featuredResult.error && featuredResult.data) setFeaturedBanner(featuredResult.data);
      if (!sliderConfigResult.error && sliderConfigResult.data) setProductSliderConfig(sliderConfigResult.data);
      if (!sliderItemsResult.error && sliderItemsResult.data) setProductSliderItems(sliderItemsResult.data);
      if (!newsletterResult.error && newsletterResult.data) setNewsletterConfig(newsletterResult.data);
      if (!visionResult.error && visionResult.data) setVisionSection(visionResult.data);
      if (!fullBannerResult.error && fullBannerResult.data) setFullBanner(fullBannerResult.data);
      if (!aboutResult.error && aboutResult.data) setAboutSection(aboutResult.data);
      if (!aboutTwoResult.error && aboutTwoResult.data) setAboutSectionTwo(aboutTwoResult.data);
      if (!aboutThreeResult.error && aboutThreeResult.data) setAboutSectionThree(aboutThreeResult.data);
      if (!aboutFourResult.error && aboutFourResult.data) setAboutSectionFour(aboutFourResult.data);
      if (!settingsResult.error && settingsResult.data) {
        const map: Record<string, string> = {};
        settingsResult.data.forEach(({ key, value }: { key: string; value: string }) => {
          map[key] = value;
        });
        setCompanyDetails({
          name: map.company_name,
          address: map.company_address,
          phone: map.company_phone,
          email: map.company_email,
          tagline: map.company_tagline,
        });
      }
    } catch (err) {
      console.error("Error fetching store data:", err);
    } finally {
      setLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    fetchHero();
    fetchStore();
  }, [fetchHero, fetchStore]);

  const getProductById = useCallback(
    async (id: string): Promise<Product | null> => {
      // 1. Check if already present in context
      const existing = products.find((p) => p.id === id || p.slug === id);
      if (existing) return existing;

      // 2. Fallback fetch from database if accessed directly
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select(`*, category:categories(id, name, slug)`)
          .or(`id.eq.${id},slug.eq.${id}`)
          .single();

        if (error || !data) return null;
        return data as Product;
      } catch {
        return null;
      }
    },
    [products]
  );

  return (
    <StoreContext.Provider
      value={{
        heroSlides,
        heroConfig,
        promoBanner,
        featuredBanner,
        fullBanner,
        productSliderConfig,
        productSliderItems,
        newsletterConfig,
        visionSection,
        aboutSection,
        aboutSectionTwo,
        aboutSectionThree,
        aboutSectionFour,
        badges,
        categories,
        products,
        companyDetails,
        loadingHero,
        loadingStore,
        getProductById,
        refreshStore: fetchStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};


