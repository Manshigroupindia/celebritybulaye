"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = "dark", className = "" }) => {
  const { settings } = useSiteSettings();
  const isLight = variant === "light";

  const customLogoUrl = isLight
    ? settings.branding.footerLogo || settings.branding.logo
    : settings.branding.logo;

  const siteName = settings.general.siteName || "Celebrity Bulaye";
  const words = siteName.trim().split(" ");
  const firstWord = words[0] || "Celebrity";
  const remainingWords = words.slice(1).join(" ") || "Bulaye";

  return (
    <Link
      href="/"
      aria-label={siteName}
      className={`inline-flex items-center gap-2 sm:gap-2.5 group transition-opacity hover:opacity-95 ${className}`}
    >
      {/* Brand Emblem / Image Logo */}
      {customLogoUrl ? (
        <div className="relative h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 flex items-center justify-center shrink-0">
          <Image
            src={customLogoUrl}
            alt={siteName}
            width={40}
            height={40}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 transition-transform duration-300 group-hover:scale-105 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer glow ring */}
            <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
            {/* 8-pointed star */}
            <path
              d="M50 8L59 36L88 38L65 56L72 84L50 68L28 84L35 56L12 38L41 36L50 8Z"
              fill="url(#goldGrad)"
              stroke="#C5A059"
              strokeWidth="1.5"
            />
            {/* Inner accent diamond */}
            <path d="M50 32L56 50L50 68L44 50Z" fill="#740D16" />
            <circle cx="50" cy="50" r="4" fill="#FFE5A3" />
            <defs>
              <linearGradient id="goldGrad" x1="12" y1="8" x2="88" y2="84" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F5D77F" />
                <stop offset="0.5" stopColor="#D4AF37" />
                <stop offset="1" stopColor="#9A7730" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Brand Wordmark Typography */}
      <div className="flex flex-col tracking-tight select-none">
        <span
          className={`font-extrabold text-base sm:text-lg md:text-xl tracking-wider uppercase font-serif leading-none ${
            isLight ? "text-white" : "text-gray-900"
          }`}
        >
          {firstWord}
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
          <span className="h-[1px] w-2 sm:w-2.5 bg-[#C5A059]" />
          <span
            className={`text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase leading-none ${
              isLight ? "text-[#FFE5A3]" : "text-[#9B111E]"
            }`}
          >
            {remainingWords}
          </span>
          <span className="h-[1px] w-2 sm:w-2.5 bg-[#C5A059]" />
        </div>
      </div>
    </Link>
  );
};
