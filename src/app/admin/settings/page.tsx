"use client";

import React, { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyTagline, setCompanyTagline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.settings) {
          setCompanyName(data.settings.company_name || "");
          setCompanyAddress(data.settings.company_address || "");
          setCompanyPhone(data.settings.company_phone || "");
          setCompanyEmail(data.settings.company_email || "");
          setCompanyTagline(data.settings.company_tagline || "");
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            company_name: companyName.trim(),
            company_address: companyAddress.trim(),
            company_phone: companyPhone.trim(),
            company_email: companyEmail.trim(),
            company_tagline: companyTagline.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings.");

      setStatusMsg({ type: "success", text: "Company details updated successfully!" });
    } catch (err: any) {
      console.error("Save error:", err);
      setStatusMsg({ type: "error", text: err.message || "Failed to save company details." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 rounded" />
        <div className="h-[400px] bg-white border border-neutral-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-wide">Company & Store Settings</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your business information, store address, and contact details displayed across the store and footer.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
              : "bg-red-950/50 border-red-800/80 text-red-300"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="text-neutral-400 hover:text-white text-xs ml-4">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-neutral-200 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
              Business Information
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              These details are displayed in the footer and customer-facing pages.
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Company / Brand Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Shaz Al Oud W.L.L."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors text-sm font-medium"
            />
          </div>

          {/* Store Address */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Physical Store Address
            </label>
            <textarea
              rows={3}
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="e.g. Souq Asiery, Doha, State of Qatar"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors text-sm font-medium resize-none"
            />
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="e.g. +974 5555 1234"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors text-sm font-medium"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
                Support Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="e.g. info@shazaloud.com"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors text-sm font-medium"
              />
            </div>
          </div>

          {/* Tagline / Description */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-bold font-mono">
              Brand Tagline
            </label>
            <input
              type="text"
              value={companyTagline}
              onChange={(e) => setCompanyTagline(e.target.value)}
              placeholder="e.g. Exquisite luxury fragrances and authentic pure oud crafted for timeless elegance."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors text-sm font-medium"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-neutral-200">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold tracking-wider uppercase text-xs rounded-lg transition-colors cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Company Details"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
