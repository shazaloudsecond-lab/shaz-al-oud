import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      <Navbar />
      <div className="pt-16 sm:pt-20 flex-1">
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
}
