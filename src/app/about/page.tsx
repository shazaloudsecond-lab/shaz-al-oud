import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import AboutSectionTwo from "@/components/AboutSectionTwo";
import AboutBlendedSection from "@/components/AboutBlendedSection";
import AboutAccordionSection from "@/components/AboutAccordionSection";
import VisionSection from "@/components/VisionSection";
import Badges from "@/components/Badges";
import NewsletterSection from "@/components/NewsletterSection";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      <Navbar />
      <div className="pt-20 sm:pt-20 flex-1 space-y-12 sm:space-y-16 pb-12 sm:pb-20">
        <AboutSection />
        <AboutSectionTwo />
        <VisionSection />
        <AboutAccordionSection />
       
        <AboutBlendedSection />
         <Badges />
         <NewsletterSection/>
      </div>
      <Footer />
    </main>
  );
}
