"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CartDrawer() {
  const router = useRouter();
  const { formatPrice, resolvePrice } = useCountry();
  const { isRTL, t, getProductName } = useLanguage();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalItems,
  } = useCart();

  const dynamicTotalPrice = cartItems.reduce((acc, item) => {
    const pr = resolvePrice(item.product, item.product.volume).price;
    return acc + pr * item.quantity;
  }, 0);

  // Close cart on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };
    if (isCartOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isCartOpen, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Slide-out Drawer (LTR from right, RTL from left) */}
      <aside
        className={`fixed top-0 bottom-0 ${
          isRTL ? "left-0" : "right-0"
        } w-full sm:w-[420px] max-w-[95vw] bg-neutral-950 text-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out transform border-neutral-800 ${
          isCartOpen
            ? "translate-x-0"
            : isRTL
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 h-20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold uppercase tracking-widest text-neutral-100 font-primary">
              {t("cart.title", "Shopping Cart")}
            </h2>
            <span className="text-xs text-[#f0d5c8] px-2.5 py-0.5 font-mono font-medium">
              {totalItems}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label={t("common.close", "Close cart")}
            className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center py-2 text-neutral-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
                  {t("cart.empty_title", "Your cart is empty")}
                </p>
                <p className="text-xs text-neutral-500 max-w-xs">
                  {t("cart.empty_desc", "Explore our luxury Arabian oud and fragrance collection.")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="mt-4 px-6 py-2.5 bg-white hover:bg-[#f0d5c8] text-black text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                {t("cart.start_shopping", "Explore Fragrances")}
              </button>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => {
              const itemPricing = resolvePrice(product, product.volume);

              return (
                <div
                  key={product.id}
                  className="flex gap-4 p-3.5 bg-neutral-900/70 relative group transition-colors hover:border-neutral-700"
                >
                  {/* Product Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-neutral-100 truncate">
                        {getProductName(product)}
                      </h3>
                      {product.volume && (
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">
                          {product.volume}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-[#dfc3b4] mt-1 font-mono">
                        {formatPrice(itemPricing.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-neutral-800 overflow-hidden bg-neutral-950 h-7">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 bg-white transition-colors text-xs cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-neutral-200 font-mono">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-full flex items-center justify-center text-neutral-400 hover:text-white bg-white hover:bg-neutral-800 transition-colors text-xs cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        = {formatPrice(itemPricing.price * quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Delete / Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={t("cart.remove", "Remove item")}
                    className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Subtotal & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-neutral-800 space-y-4 bg-neutral-950 flex-shrink-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs uppercase tracking-wider text-neutral-400">
                {t("cart.subtotal", "Subtotal")}
              </span>
              <span className="text-base font-semibold text-white font-mono">
                {formatPrice(dynamicTotalPrice)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {t("cart.shipping_note", "Taxes and delivery calculated at checkout.")}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] rounded-sm text-black font-semibold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-black/40 text-center"
              >
                {t("cart.checkout", "Checkout")} • {formatPrice(dynamicTotalPrice)}
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="w-full py-2 text-center text-xs text-neutral-400 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
              >
                {t("common.continue_shopping", "Continue Shopping")}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
