"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div dir="ltr" className="admin-theme min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo/logo.png"
            alt="Shaz Al Oud"
            width={160}
            height={50}
            priority
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl sm:px-10">
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-300 text-red-700 text-sm p-3.5 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2 font-mono">
                Admin Email
              </label>
              <input
                type="email"
                name="admin_login_email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shazaloud.com"
                style={{ outline: "none", boxShadow: "none" }}
                className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus:border-neutral-300 transition-colors text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2 font-mono">
                Password
              </label>
              <input
                type="password"
                name="admin_login_password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ outline: "none", boxShadow: "none" }}
                className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus:border-neutral-300 transition-colors text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-xs transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 font-mono"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
