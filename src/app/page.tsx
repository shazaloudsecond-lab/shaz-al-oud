import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PromoBanners from "@/components/PromoBanners";
import ProductSection from "@/components/ProductSection";
import Badges from "@/components/Badges";
import FeaturedBanner from "@/components/FeaturedBanner";
import FullBanner from "@/components/FullBanner";
import ProductSlider from "@/components/ProductSlider";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import VisionSection from "@/components/VisionSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <ProductSection />
      <PromoBanners />
      {/* <FullBanner /> */}
      <ProductSlider />
      <FeaturedBanner />
      <VisionSection />
      <Badges />
      <NewsletterSection />
      <Footer />
    </main>
  );
}



