"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { useAdminAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin, loading, signIn, sendPasswordReset } = useAdminAuth();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password state & 60s cooldown timer
  const [resetSent, setResetSent] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownSeconds]);

  // If already logged in and authorized, redirect to /admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace("/admin");
    }
  }, [user, isAdmin, loading, router]);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(email.trim(), password);
      if (res.success) {
        router.replace("/admin");
      } else {
        setErrorMessage(res.error || "Failed to sign in. Please verify your credentials.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid administrator email address.");
      return;
    }

    if (cooldownSeconds > 0) return;

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
      setCooldownSeconds(60); // 60s cooldown UX safeguard
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error requesting reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Cinematic Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9B111E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9B111E] to-[#740D16] border border-[#C5A059]/40 flex items-center justify-center text-white shadow-xl shadow-red-950/50">
              <Sparkles className="w-6 h-6 text-[#FFE5A3]" />
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-tight">
            Celebrity Bulaye CMS
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-light">
            Authorized Administrator & Talent Desk Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121826]/90 backdrop-blur-xl rounded-3xl border border-gray-800 p-6 sm:p-8 shadow-2xl space-y-6">
          {mode === "login" ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Secure Sign In</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                  Firebase Auth
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@celebritybulaye.com"
                    className="w-full bg-[#0B0F19] border border-gray-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#FFE5A3] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B0F19] border border-gray-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin CMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Closed Access Notice */}
              <div className="pt-3 border-t border-gray-800 text-center">
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  <strong className="text-gray-400 font-semibold block">Closed Registration:</strong>
                  Public sign-up is disabled. Accounts are provisioned exclusively by platform owners via Firebase Console.
                </p>
              </div>
            </form>
          ) : (
            /* Forgot Password Flow */
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Reset Administrator Password</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                  }}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {resetSent ? (
                /* Success & Guidance Message */
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-emerald-950/50 border border-emerald-800/60 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Password Reset Link Dispatched</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      If an account exists for <strong className="text-white">{email}</strong>, a secure password-reset link has been transmitted.
                    </p>
                  </div>

                  {/* EXACT Hindi/Hinglish Guidance Notice Required */}
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFE5A3] block">
                      Zaroori Jankari / Important Notice:
                    </span>
                    <p className="text-xs leading-relaxed font-medium text-amber-100">
                      “Reset email nahi mila? Apne Spam/Junk folder ko bhi check karein. Agar email wahan bhi nahi hai, toh 1 minute baad Resend Reset Link par click karein.”
                    </p>
                  </div>

                  {/* Resend Action with 60-second cooldown */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleForgotSubmit()}
                      disabled={isSubmitting || cooldownSeconds > 0}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        cooldownSeconds > 0
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50"
                          : "bg-gradient-to-r from-[#9B111E] to-[#740D16] hover:from-[#740D16] hover:to-[#550910] text-white shadow-md cursor-pointer"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Link...</span>
                        </>
                      ) : cooldownSeconds > 0 ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 animate-spin text-gray-400" />
                          <span>Resend available in {cooldownSeconds}s</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Resend Reset Link</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center">
                      60-second cooldown active to prevent repetitive request spam.
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-xs text-[#FFE5A3] hover:underline"
                    >
                      ← Return to Admin Sign In
                    </button>
                  </div>
                </div>
              ) : (
                /* Initial Email Entry for Reset */
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Enter your registered administrator email address to receive an official password reset link.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@celebritybulaye.com"
                        className="w-full bg-[#0B0F19] border border-gray-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#9B111E] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching Reset Email...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Back to Public Website link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Exit to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
