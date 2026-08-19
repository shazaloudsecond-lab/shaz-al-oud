"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product } from "./StoreContext";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
  loadingCart: boolean;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const CART_STORAGE_KEY = "shaz_al_oud_cart";
const SESSION_STORAGE_KEY = "shaz_cart_session_id";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Get or create persistent session ID & check user
  useEffect(() => {
    let currentSession = "";
    try {
      currentSession = localStorage.getItem(SESSION_STORAGE_KEY) || "";
      if (!currentSession) {
        currentSession = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem(SESSION_STORAGE_KEY, currentSession);
      }
      setSessionId(currentSession);

      // Load cached items for instantaneous render
      const localCached = localStorage.getItem(CART_STORAGE_KEY);
      if (localCached) {
        setCartItems(JSON.parse(localCached));
      }
    } catch {
      currentSession = "sess_" + Date.now().toString(36);
      setSessionId(currentSession);
    }

    // Check user auth and fetch from DB
    const syncFromDB = async () => {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getSession();
        const currentUserId = authData.session?.user?.id || null;
        setUserId(currentUserId);

        let query = supabase
          .from("cart_items")
          .select(`product_id, quantity, product:products(*)`);

        if (currentUserId) {
          query = query.or(`user_id.eq.${currentUserId},session_id.eq.${currentSession}`);
        } else {
          query = query.eq("session_id", currentSession);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          const itemsFromDB: CartItem[] = data
            .filter((row: any) => row.product)
            .map((row: any) => ({
              product: row.product,
              quantity: row.quantity,
            }));

          setCartItems(itemsFromDB);
          try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(itemsFromDB));
          } catch {}
        }
      } catch (err) {
        console.error("Cart sync from DB error:", err);
      } finally {
        setLoadingCart(false);
      }
    };

    syncFromDB();
  }, []);

  // Helper to persist to localStorage
  const updateLocal = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  };

  // 2. Add to Cart with DB sync
  const addToCart = useCallback(
    async (product: Product, quantity: number = 1) => {
      if (!product || !product.id) return;

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.product.id === product.id);
        let newItems: CartItem[];
        if (existingIndex > -1) {
          newItems = [...prev];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity,
          };
        } else {
          newItems = [...prev, { product, quantity }];
        }
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        } catch {}
        return newItems;
      });

      setIsCartOpen(true);

      // Async DB Sync
      try {
        const supabase = createClient();
        const activeSess = sessionId || localStorage.getItem(SESSION_STORAGE_KEY) || "";

        // Check if item exists in DB
        let checkQuery = supabase.from("cart_items").select("id, quantity").eq("product_id", product.id);
        if (userId) {
          checkQuery = checkQuery.or(`user_id.eq.${userId},session_id.eq.${activeSess}`);
        } else {
          checkQuery = checkQuery.eq("session_id", activeSess);
        }

        const { data: existingRows } = await checkQuery.limit(1);

        if (existingRows && existingRows.length > 0) {
          const row = existingRows[0];
          await supabase
            .from("cart_items")
            .update({
              quantity: row.quantity + quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);
        } else {
          await supabase.from("cart_items").insert([
            {
              user_id: userId || null,
              session_id: activeSess,
              product_id: product.id,
              quantity,
              updated_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to sync add to cart in DB:", err);
      }
    },
    [sessionId, userId]
  );

  // 3. Remove from Cart with DB sync
  const removeFromCart = useCallback(
    async (productId: string) => {
      setCartItems((prev) => {
        const newItems = prev.filter((item) => item.product.id !== productId);
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        } catch {}
        return newItems;
      });

      // Async DB Delete
      try {
        const supabase = createClient();
        const activeSess = sessionId || localStorage.getItem(SESSION_STORAGE_KEY) || "";
        let delQuery = supabase.from("cart_items").delete().eq("product_id", productId);
        if (userId) {
          delQuery = delQuery.or(`user_id.eq.${userId},session_id.eq.${activeSess}`);
        } else {
          delQuery = delQuery.eq("session_id", activeSess);
        }
        await delQuery;
      } catch (err) {
        console.error("Failed to delete cart item from DB:", err);
      }
    },
    [sessionId, userId]
  );

  // 4. Update Quantity with DB sync
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems((prev) => {
        const newItems = prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
        } catch {}
        return newItems;
      });

      // Async DB Update
      try {
        const supabase = createClient();
        const activeSess = sessionId || localStorage.getItem(SESSION_STORAGE_KEY) || "";
        let updQuery = supabase
          .from("cart_items")
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq("product_id", productId);

        if (userId) {
          updQuery = updQuery.or(`user_id.eq.${userId},session_id.eq.${activeSess}`);
        } else {
          updQuery = updQuery.eq("session_id", activeSess);
        }
        await updQuery;
      } catch (err) {
        console.error("Failed to update cart quantity in DB:", err);
      }
    },
    [removeFromCart, sessionId, userId]
  );

  // 5. Clear Cart with DB sync
  const clearCart = useCallback(async () => {
    updateLocal([]);
    try {
      const supabase = createClient();
      const activeSess = sessionId || localStorage.getItem(SESSION_STORAGE_KEY) || "";
      let delQuery = supabase.from("cart_items").delete();
      if (userId) {
        delQuery = delQuery.or(`user_id.eq.${userId},session_id.eq.${activeSess}`);
      } else {
        delQuery = delQuery.eq("session_id", activeSess);
      }
      await delQuery;
    } catch (err) {
      console.error("Failed to clear cart in DB:", err);
    }
  }, [sessionId, userId]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.product.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        totalPrice,
        loadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
