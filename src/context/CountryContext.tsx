"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Country, getDefaultCountry, resolveProductPricing } from "@/lib/countries";

interface CountryContextProps {
  country: Country | null;
  countries: Country[];
  currencyCode: string;
  currencySymbol: string;
  isLoading: boolean;
  setCountry: (country: Country) => void;
  selectCountryByCode: (code: string) => void;
  formatPrice: (amount: number | string | null | undefined, showSymbol?: boolean) => string;
  resolvePrice: (
    product: any,
    selectedVolume?: string | null
  ) => {
    price: number;
    original_price?: number | null;
    volume: string;
    is_in_stock: boolean;
    is_available: boolean;
  };
}

const CountryContext = createContext<CountryContextProps | undefined>(undefined);

const COUNTRY_STORAGE_KEY = "shaz_user_selected_country";

export const CountryProvider = ({ children }: { children: React.ReactNode }) => {
  const [country, setCountryState] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load and auto-detect country strictly from DB
  useEffect(() => {
    let isMounted = true;

    const initCountry = async () => {
      try {
        const savedCode = typeof window !== "undefined" ? localStorage.getItem(COUNTRY_STORAGE_KEY) : null;

        // 1. Fetch available DB countries & server-side detection
        const res = await fetch("/api/country/detect");
        const data = await res.json();

        if (!isMounted) return;

        const fetchedCountries: Country[] =
          data.countries && Array.isArray(data.countries) ? data.countries : [];

        setCountries(fetchedCountries);

        if (fetchedCountries.length === 0) {
          setCountryState(null);
          setIsLoading(false);
          return;
        }

        // 2. If user previously manually clicked/selected a country, prioritize their saved choice
        if (savedCode) {
          const savedMatch = fetchedCountries.find(
            (c) =>
              c.is_active &&
              (c.code.toUpperCase().trim() === savedCode.toUpperCase().trim() ||
                (savedCode.toUpperCase() === "IN" && (c.code === "91" || c.name.toUpperCase().includes("INDIA"))) ||
                (savedCode.toUpperCase() === "QA" && (c.code === "974" || c.name.toUpperCase().includes("QATAR"))) ||
                (savedCode.toUpperCase() === "BH" && (c.code === "973" || c.name.toUpperCase().includes("BAHRAIN"))))
          );
          if (savedMatch) {
            setCountryState(savedMatch);
            setIsLoading(false);
            return;
          }
        }

        // 3. If server genuinely detected the customer's country from headers/public IP
        if (data.isDetected && data.country && data.country.is_active) {
          setCountryState(data.country);
          setIsLoading(false);
          return;
        }

        // 4. Client-side browser auto-detection (works in local dev & direct browser requests)
        try {
          const clientGeoRes = await fetch("https://api.country.is/", { cache: "no-store" });
          if (clientGeoRes.ok) {
            const clientGeo = await clientGeoRes.json();
            const clientCode = clientGeo?.country ? clientGeo.country.toUpperCase().trim() : null;

            if (clientCode && isMounted) {
              const clientMatch = fetchedCountries.find(
                (c) =>
                  c.is_active &&
                  (c.code.toUpperCase().trim() === clientCode ||
                    c.name.toUpperCase().trim() === clientCode ||
                    (clientCode === "IN" && (c.code === "91" || c.name.toUpperCase().includes("INDIA"))) ||
                    (clientCode === "QA" && (c.code === "974" || c.name.toUpperCase().includes("QATAR"))) ||
                    (clientCode === "BH" && (c.code === "973" || c.name.toUpperCase().includes("BAHRAIN"))))
              );

              if (clientMatch) {
                // Detected country is active in DB -> Auto switch!
                setCountryState(clientMatch);
                setIsLoading(false);
                return;
              }
            }
          }
        } catch {
          // Ignore external lookup failure
        }

        // 5. Fallback for unlaunched country -> show Qatar (QA as main)
        const fallbackMainCountry = getDefaultCountry(fetchedCountries);
        if (isMounted) {
          setCountryState(fallbackMainCountry);
        }
      } catch (err) {
        console.error("Country detection error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initCountry();

    return () => {
      isMounted = false;
    };
  }, []);

  const setCountry = useCallback((newCountry: Country) => {
    setCountryState(newCountry);
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, newCountry.code);
    } catch {}
  }, []);

  const selectCountryByCode = useCallback(
    (code: string) => {
      const match = countries.find(
        (c) =>
          c.is_active &&
          (c.code.toUpperCase().trim() === code.toUpperCase().trim() ||
            (code.toUpperCase() === "IN" && (c.code === "91" || c.name.toUpperCase().includes("INDIA"))) ||
            (code.toUpperCase() === "QA" && (c.code === "974" || c.name.toUpperCase().includes("QATAR"))) ||
            (code.toUpperCase() === "BH" && (c.code === "973" || c.name.toUpperCase().includes("BAHRAIN"))))
      );
      if (match) {
        setCountry(match);
      }
    },
    [countries, setCountry]
  );

  const formatPrice = useCallback(
    (amount: number | string | null | undefined, showSymbol: boolean = true): string => {
      if (amount == null || amount === "") return "—";
      const num = typeof amount === "number" ? amount : parseFloat(amount);
      if (isNaN(num)) return "—";

      const formattedNum = num.toFixed(0);
      const symbol = country?.currency_code || country?.currency_symbol || "";
      return showSymbol && symbol ? `${formattedNum} ${symbol}` : formattedNum;
    },
    [country]
  );

  const resolvePrice = useCallback(
    (product: any, selectedVolume?: string | null) => {
      if (!product) {
        return { price: 0, original_price: null, volume: selectedVolume || "30ml", is_in_stock: false, is_available: false };
      }
      return resolveProductPricing(product, country?.code, selectedVolume);
    },
    [country]
  );

  return (
    <CountryContext.Provider
      value={{
        country,
        countries,
        currencyCode: country?.currency_code || "",
        currencySymbol: country?.currency_symbol || "",
        isLoading,
        setCountry,
        selectCountryByCode,
        formatPrice,
        resolvePrice,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
};
