import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CountryProvider } from "@/context/CountryContext";
import { StoreProvider } from "@/context/StoreContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import PreIntroWrapper from "@/components/PreIntroWrapper";

export const metadata: Metadata = {
  title: "Shaz Al Oud | Luxury Fragrances & Perfumes",
  description: "Exquisite and luxury Arabian fragrances, oud, and perfumes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anek+Expanded:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col font-secondary bg-black text-white"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <CountryProvider>
            <StoreProvider>
              <CartProvider>
                <PreIntroWrapper />
                {children}
                <CartDrawer />
              </CartProvider>
            </StoreProvider>
          </CountryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
