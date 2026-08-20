"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore, Product } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { products, loadingStore, getProductById } = useStore();
  const { addToCart, openCart } = useCart();
  const { country, formatPrice, resolvePrice } = useCountry();
  const { t, tDynamic, isRTL } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!id) return;

      const foundInContext = products.find((p) => p.id === id || p.slug === id);
      if (foundInContext) {
        if (isMounted) {
          setProduct(foundInContext);
          setActiveImage(foundInContext.image_url || "");
          setSelectedVariantIdx(0);
          setLoading(false);
        }
        return;
      }

      if (loadingStore) {
        setLoading(true);
        return;
      }

      setLoading(true);
      const fetched = await getProductById(id);
      if (isMounted) {
        setProduct(fetched);
        if (fetched) {
          setActiveImage(fetched.image_url || "");
          setSelectedVariantIdx(0);
        }
        setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, products, loadingStore, getProductById]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white font-sans pb-24 select-none">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 relative z-10">
          <div className="mb-6 lg:mb-10">
            <div className="h-4 w-32 bg-neutral-900 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-900 aspect-square w-full animate-pulse flex items-center justify-center p-8 relative shadow-sm overflow-hidden">
                <div className="w-1/2 h-1/2 bg-neutral-900 rounded-2xl animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="space-y-3">
                <div className="h-10 sm:h-12 w-3/4 bg-neutral-900 rounded-xl animate-pulse" />
                <div className="h-6 w-28 bg-neutral-900 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center relative z-10">
          <h1 className="text-3xl font-serif text-white mb-4">{t("order.not_found", "Product Not Found")}</h1>
          <p className="text-neutral-400 mb-8">{t("order.not_found_desc", "The fragrance you are looking for does not exist or has been removed.")}</p>
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-white hover:bg-[#f0d5c8] text-black text-sm font-semibold transition-colors">
            {t("order.back_home", "Return to Collection")}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Determine active variants with country pricing
  const rawVariants =
    product.variants && Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [
          {
            volume: product.volume || "30ml",
            price: product.price,
            original_price: product.original_price,
          },
        ];

  const activeVariants = rawVariants
    .map((v) => {
      const p = resolvePrice(product, v.volume);
      return {
        volume: v.volume,
        price: p.price,
        original_price: p.original_price,
        is_in_stock: v.is_in_stock !== false && p.is_in_stock !== false,
        is_available: p.is_available,
      };
    })
    .filter((v) => v.is_available);

  const safeIdx = activeVariants.length > 0 ? Math.min(selectedVariantIdx, activeVariants.length - 1) : 0;
  const currentVariant = activeVariants[safeIdx] || null;
  const isAvailableInCountry = activeVariants.length > 0 && currentVariant !== null;
  const activePrice = currentVariant ? currentVariant.price : 0;
  const activeOriginalPrice = currentVariant ? currentVariant.original_price : null;
  const isCurrentlyInStock = isAvailableInCountry && currentVariant.is_in_stock && product.is_in_stock !== false;

  const handleAddToCart = () => {
    if (!currentVariant || !isAvailableInCountry || !isCurrentlyInStock) return;
    const productWithVariant: Product = {
      ...product,
      volume: currentVariant.volume,
      price: activePrice,
      original_price: activeOriginalPrice,
    };
    addToCart(productWithVariant, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    openCart();
  };

  const displayName = tDynamic(product.our_signature || product.name);
  const displayBrand = product.brand_name ? tDynamic(product.brand_name) : null;
  const displayCategory = product.category?.name ? tDynamic(product.category.name) : null;
  const displayDescription = product.description ? tDynamic(product.description) : `${displayName} is a luxurious fragrance from our ${displayCategory || "exclusive"} collection.`;

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 relative z-10 pb-24">
        {/* Breadcrumb */}
        <div className="mb-6 lg:mb-10">
          <Link href="/" className="text-[13px] text-neutral-400 hover:text-white font-medium transition-colors flex items-center gap-2 w-fit">
            <svg className={`w-4 h-4 transform ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t("nav.home", "Home")} / {t("nav.collection", "Products")}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left Column: Image Area */}
          <div className="space-y-4">
            {/* Main Display Image */}
            <div className="bg-neutral-950 aspect-square flex items-center justify-center p-8 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              <img 
                src={activeImage || product.image_url} 
                alt={product.name} 
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition-opacity duration-300"
              />
              <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((imgUrl: string, idx: number) => {
                  const isActive = activeImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all ${
                        isActive
                          ? "border-white shadow-lg"
                          : "border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600"
                      } bg-neutral-950 flex items-center justify-center p-2 cursor-pointer`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Details Area */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-[40px] font-medium text-white tracking-tight leading-tight">
              {displayName}
            </h1>
            
            {/* Price Display */}
            <div className="mt-3 flex items-center gap-3">
              <p className="text-3xl font-semibold text-[#dfc3b4] font-mono">
                {formatPrice(activePrice)}
              </p>
              {activeOriginalPrice != null && activeOriginalPrice > activePrice && (
                <p className="text-base text-neutral-500 line-through font-mono">
                  {formatPrice(activeOriginalPrice)}
                </p>
              )}
            </div>

            {/* Category Pill */}
            {displayCategory && (
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-[#f0d5c8] text-xs font-medium tracking-wide">
                  {displayCategory}
                </span>
              </div>
            )}

            {/* Volume Selection */}
            {activeVariants.length > 0 && (
              <div className="mt-6 pt-5 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-semibold">
                    {t("products.select_size", "Select Size / Volume")}
                  </label>
                  <span className="text-xs text-neutral-400 font-mono font-medium">
                    {tDynamic(currentVariant.volume)} • {formatPrice(activePrice)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {activeVariants.map((v, vIdx) => {
                    const isSelected = selectedVariantIdx === vIdx;
                    return (
                      <button
                        key={vIdx}
                        type="button"
                        onClick={() => setSelectedVariantIdx(vIdx)}
                        className={`px-5 py-3 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "bg-white text-black shadow-xl shadow-white/10 scale-105"
                            : "bg-neutral-900/90 text-neutral-300 hover:text-white"
                        }`}
                      >
                        <span className="">{tDynamic(v.volume)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description Accordion */}
            <div className="mt-8 overflow-hidden bg-neutral-950/60">
              <button 
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full flex items-center justify-between p-5 text-start hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-neutral-200 tracking-wide text-sm">
                  {t("products.description", "Description")}
                </span>
                <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isDescOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDescOpen && (
                <div className="px-5 pb-6 text-sm text-neutral-300 leading-relaxed font-normal">
                  {displayDescription}
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-8 flex flex-wrap sm:flex-nowrap items-center gap-4">
              <div className="flex items-center overflow-hidden h-[52px] bg-neutral-950 w-fit flex-shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center text-neutral-300 bg-neutral-900 hover:bg-neutral-800 transition-colors text-lg cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 11h14v2H5z"/></svg>
                </button>
                <span className="w-10 text-center font-semibold text-white text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!isCurrentlyInStock || !isAvailableInCountry}
                  className="w-12 h-full flex items-center justify-center text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
                </button>
              </div>

              {!isAvailableInCountry ? (
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider mx-2">
                  {t("common.unavailable", "Unavailable in selected country")}
                </span>
              ) : !isCurrentlyInStock ? (
                <span className="text-red-400 text-xs font-semibold uppercase tracking-wider mx-2">
                  {t("common.out_of_stock", "Out of Stock")}
                </span>
              ) : null}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                disabled={!isCurrentlyInStock || !isAvailableInCountry}
                onClick={handleAddToCart}
                className="w-full py-4 px-6  hover:bg-[#61472F]/70 font-semibold text-white bg-[#61472F] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[15px] cursor-pointer"
              >
                {t("products.add_to_bag", "Add to Cart")}
              </button>
              <button 
                type="button"
                disabled={!isCurrentlyInStock || !isAvailableInCountry}
                onClick={handleBuyNow}
                className="w-full py-4 px-6 bg-white hover:bg-[#f0d5c8] font-semibold text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[15px] cursor-pointer shadow-lg"
              >
                {t("cart.checkout", "Buy Now")}
              </button>
            </div>

            {/* Delivery Options Accordion */}
            <div className="mt-10 overflow-hidden bg-neutral-950/60">
              <button 
                onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                className="w-full flex items-center justify-between p-5 text-start hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-neutral-200 tracking-wide text-sm">
                  {t("products.delivery_returns", "Delivery & Returns")}
                </span>
                <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isDeliveryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDeliveryOpen && (
                <div className="px-5 pb-6 text-sm text-neutral-300 leading-relaxed font-normal pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 shadow-sm text-neutral-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 mb-0.5 uppercase tracking-wider">{t("badges.packaging_title", "Packaging")}</p>
                        <p className="text-xs font-semibold text-white">{t("badges.packaging_desc", "Bespoke gift box")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 shadow-sm text-neutral-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 mb-0.5 uppercase tracking-wider">{t("checkout.payment_title", "Payment")}</p>
                        <p className="text-xs font-semibold text-white leading-tight">{t("checkout.cod_name", "Cash on Delivery")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 shadow-sm text-neutral-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 mb-0.5 uppercase tracking-wider">{t("badges.free_delivery_title", "Delivery")}</p>
                        <p className="text-xs font-semibold text-white">{t("badges.free_delivery_desc", "Fast & Secure")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 shadow-sm text-neutral-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 mb-0.5 uppercase tracking-wider">{t("badges.authentic_title", "Authenticity")}</p>
                        <p className="text-xs font-semibold text-white">{t("badges.authentic_desc", "100% Pure Formulation")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (Only on Product Details page on mobile) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-md px-4 py-3 sm:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            disabled={!isCurrentlyInStock || !isAvailableInCountry}
            onClick={handleAddToCart}
            className="w-full py-3 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-[11px] uppercase tracking-wider text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-sans truncate"
          >
            <span>{t("products.add_to_bag", "Add to Bag")}</span>
          </button>

          <button
            type="button"
            disabled={!isCurrentlyInStock || !isAvailableInCountry}
            onClick={handleBuyNow}
            className="w-full py-3 px-2.5 bg-white hover:bg-[#f0d5c8] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-[11px] uppercase tracking-wider text-center shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans truncate"
          >
            <span>{t("cart.checkout", "Proceed to Checkout")}</span>
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
