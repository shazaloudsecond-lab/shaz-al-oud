"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup" | "forgot_email" | "forgot_otp" | "forgot_new_password";

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const router = useRouter();
  const { t, tDynamic, isRTL } = useLanguage();
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [mode, setMode] = useState<AuthMode>("signin");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetId, setResetId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check current session
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!isOpen) return;

    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user || null;
        setUser(sessionUser);

        if (sessionUser) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", sessionUser.id)
            .maybeSingle();

          setUserRole(profile?.role || "user");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };

    checkSession();
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // 1. Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const supabase = createClient();
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const role = profile?.role || (cleanEmail.startsWith("admin@") ? "admin" : "user");
        setUserRole(role);

        setSuccessMsg("Signed in successfully! Redirecting...");
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
          router.refresh();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          fullName: fullName.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to create account.");
      }

      const supabase = createClient();
      const { data: signinData, error: signinErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!signinErr && signinData.user) {
        setUser(signinData.user);
        setUserRole("user");
        setSuccessMsg("Account created! Redirecting to your account...");
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
          router.push("/");
          router.refresh();
        }, 700);
      } else {
        setSuccessMsg("Account created successfully! Please sign in.");
        setMode("signin");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Send OTP for Forgot Password
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send reset code.");
      }

      setSuccessMsg(`A 6-digit OTP code has been sent to ${cleanEmail}`);
      setMode("forgot_otp");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Invalid OTP code.");
      }

      setResetId(data.resetId || "");
      setSuccessMsg("OTP verified! Please set your new password.");
      setMode("forgot_new_password");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otp.trim(),
          resetId,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccessMsg("Password updated successfully! Please sign in with your new password.");
      setTimeout(() => {
        setMode("signin");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  // 6. Sign Out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      onClose();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign out.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-neutral-950 p-6 sm:p-8 shadow-2xl z-10 text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close", "Close")}
          className={`absolute top-5 ${isRTL ? "left-5" : "right-5"} p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-900 cursor-pointer`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {user ? (
          /* Logged In View */
          <div className="space-y-3 text-center pt-2">
            <div className="w-16 h-16 flex items-center justify-center mx-auto text-[#f0d5c8]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono">{t("nav.account", "Signed in as")}</p>
              <h3 className="text-base font-semibold text-neutral-100 mt-1 truncate max-w-xs mx-auto font-mono">
                {user.email}
              </h3>
            </div>

            {successMsg && (
              <p className="text-xs text-emerald-400 bg-emerald-950/50 p-2.5">
                {successMsg}
              </p>
            )}

            <div className="pt-2 space-y-2.5">
              <Link
                href="/account"
                onClick={onClose}
                className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] text-black text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>{t("nav.account", "Go to My Account")}</span>
                <svg className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {userRole === "admin" && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3 bg-red-950/40 hover:bg-red-950/70 text-red-300 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? t("common.loading", "Signing out...") : t("auth.logout", "Logout")}
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Forms */
          <div className="space-y-6">
            {/* Header Title */}
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-semibold tracking-wide text-white font-primary uppercase">
                {mode === "signin"
                  ? t("auth.sign_in_tab", "Sign In")
                  : mode === "signup"
                  ? t("auth.register_tab", "Create Account")
                  : t("auth.forgot_password", "Reset Password")}
              </h3>
              <p className="text-xs text-neutral-400">
                {mode === "signin"
                  ? t("auth.sign_in_tab", "Sign in to access your orders and profile")
                  : mode === "signup"
                  ? t("auth.register_tab", "Join Shaz Al Oud for exclusive fragrance collections")
                  : mode === "forgot_email"
                  ? t("auth.otp_desc", "Enter your email to receive a 6-digit OTP code")
                  : mode === "forgot_otp"
                  ? t("auth.otp_title", "Enter the 6-digit OTP sent to your email")
                  : t("auth.password", "Set a new secure password for your account")}
              </p>
            </div>

            {/* Mode Switcher (Sign In vs Register) */}
            {(mode === "signin" || mode === "signup") && (
              <div className="flex bg-neutral-900 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    mode === "signin"
                      ? "bg-white text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t("auth.sign_in_tab", "Sign In")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    mode === "signup"
                      ? "bg-white text-black shadow-md"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t("auth.register_tab", "Register")}
                </button>
              </div>
            )}

            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-950/60 text-center text-red-300 text-xs">
                {tDynamic(errorMsg)}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-center text-emerald-300 text-xs">
                {tDynamic(successMsg)}
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("auth.email", "Email Address")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                      {t("auth.password", "Password")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot_email");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-[#f0d5c8] hover:underline cursor-pointer"
                    >
                      {t("auth.forgot_password", "Forgot password?")}
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-lg cursor-pointer flex items-center justify-center mt-2"
                >
                  {loading ? t("common.loading", "Signing In...") : t("auth.sign_in_btn", "Sign In")}
                </button>
              </form>
            )}

            {/* 2. REGISTER FORM */}
            {mode === "signup" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("checkout.full_name", "Full Name (Optional)")}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("checkout.full_name_placeholder", "Your Name")}
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("auth.email", "Email Address")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("auth.password", "Password")}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-lg cursor-pointer flex items-center justify-center mt-2"
                >
                  {loading ? t("common.loading", "Creating Account...") : t("auth.register_btn", "Create Account")}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD: ENTER EMAIL */}
            {mode === "forgot_email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("auth.email", "Account Email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-lg cursor-pointer flex items-center justify-center mt-2"
                >
                  {loading ? t("common.loading", "Sending OTP...") : t("auth.verify_btn", "Send OTP Code")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full text-center text-xs text-neutral-400 hover:text-white cursor-pointer py-1"
                >
                  ← {t("common.back", "Back to Sign In")}
                </button>
              </form>
            )}

            {/* 4. FORGOT PASSWORD: ENTER OTP */}
            {mode === "forgot_otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("auth.otp_title", "6-Digit OTP Code")}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full px-4 py-3.5 bg-neutral-900 text-center text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-xl tracking-[8px] font-mono transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-lg cursor-pointer flex items-center justify-center mt-2"
                >
                  {loading ? t("common.loading", "Verifying...") : t("auth.verify_btn", "Verify OTP Code")}
                </button>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="hover:text-[#f0d5c8] cursor-pointer"
                  >
                    {t("auth.resend_otp", "Resend Code")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("forgot_email")}
                    className="hover:text-white cursor-pointer"
                  >
                    {t("common.cancel", "Change Email")}
                  </button>
                </div>
              </form>
            )}

            {/* 5. FORGOT PASSWORD: SET NEW PASSWORD */}
            {mode === "forgot_new_password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("auth.password", "New Password")}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    {t("auth.confirm_password", "Confirm New Password")}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-[#f0d5c8] disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-widest transition-all shadow-lg cursor-pointer flex items-center justify-center mt-2"
                >
                  {loading ? t("common.loading", "Updating Password...") : t("auth.verify_btn", "Set New Password")}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
