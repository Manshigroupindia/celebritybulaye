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
  const { settings, isMounted } = useSiteSettings();
  const isLight = variant === "light";

  const customLogoUrl = isLight
    ? settings.branding.footerLogo || settings.branding.logo
    : settings.branding.logo;

  const siteName = settings.general.siteName || "Celebrity Bulaye";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* If custom image logo is configured, display it */}
      {customLogoUrl ? (
        <div className="relative h-10 w-auto min-w-[120px] max-w-[200px] flex items-center">
          <Image
            src={customLogoUrl}
            alt={siteName}
            width={160}
            height={44}
            className="h-9 sm:h-10 w-auto object-contain"
            priority
          />
        </div>
      ) : (
        <>
          {/* Premium Celebrity Star Emblem */}
          <div className="relative flex items-center justify-center w-10 h-10 transition-transform duration-300 group-hover:scale-105 shrink-0">
            <svg viewBox="0 0 100 100" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          {/* Brand Wordmark */}
          <div className="flex flex-col tracking-tight">
            <div className="flex items-center gap-1">
              <span
                className={`font-extrabold text-lg sm:text-xl tracking-wider uppercase font-serif ${
                  isLight ? "text-white" : "text-gray-900"
                }`}
              >
                {siteName.split(" ")[0] || "Celebrity"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 -mt-1">
              <span className="h-[1px] w-2.5 bg-[#C5A059]" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#9B111E] uppercase">
                {siteName.split(" ").slice(1).join(" ") || "Bulaye"}
              </span>
              <span className="h-[1px] w-2.5 bg-[#C5A059]" />
            </div>
          </div>
        </>
      )}
    </Link>
  );
};
