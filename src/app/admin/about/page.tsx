"use client";

import React, { useState } from "react";
import AdminAboutComp1Form from "@/components/admin/AdminAboutComp1Form";
import AdminAboutComp2Form from "@/components/admin/AdminAboutComp2Form";
import AdminAboutComp3Form from "@/components/admin/AdminAboutComp3Form";
import AdminAboutComp4Form from "@/components/admin/AdminAboutComp4Form";

export default function AdminAboutPage() {
  const [activeTab, setActiveTab] = useState<"comp1" | "comp2" | "comp3" | "comp4">("comp1");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-wide">About Page Configuration</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Manage and configure all sections of the About Us page.
        </p>
      </div>

      {/* High-Contrast Segmented Tabs */}
      <div className="bg-neutral-100 p-1.5 rounded-xl flex flex-col md:flex-row gap-2 border border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab("comp1")}
          className={`flex-1 py-3 px-2 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "comp1"
              ? "!bg-black !text-white shadow-md"
              : "!bg-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              activeTab === "comp1" ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-neutral-400"
            }`}
          />
          <span className="truncate">Component 1</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comp2")}
          className={`flex-1 py-3 px-2 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "comp2"
              ? "!bg-black !text-white shadow-md"
              : "!bg-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              activeTab === "comp2" ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-neutral-400"
            }`}
          />
          <span className="truncate">Component 2</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comp3")}
          className={`flex-1 py-3 px-2 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "comp3"
              ? "!bg-black !text-white shadow-md"
              : "!bg-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              activeTab === "comp3" ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-neutral-400"
            }`}
          />
          <span className="truncate">Component 3 (FAQ)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comp4")}
          className={`flex-1 py-3 px-2 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "comp4"
              ? "!bg-black !text-white shadow-md"
              : "!bg-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              activeTab === "comp4" ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-neutral-400"
            }`}
          />
          <span className="truncate">Component 4 (Craft)</span>
        </button>
      </div>

      {/* Render Selected Component */}
      {activeTab === "comp1" && <AdminAboutComp1Form />}
      {activeTab === "comp2" && <AdminAboutComp2Form />}
      {activeTab === "comp3" && <AdminAboutComp3Form />}
      {activeTab === "comp4" && <AdminAboutComp4Form />}
    </div>
  );
}
