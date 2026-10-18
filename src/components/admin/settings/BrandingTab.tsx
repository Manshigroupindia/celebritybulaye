"use client";

import React from "react";
import { BrandingSettings } from "@/types/settings";
import { Palette, Sparkles, Image as ImageIcon } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";
import { Logo } from "@/components/common/Logo";

interface BrandingTabProps {
  data: BrandingSettings;
  onChange: (updated: Partial<BrandingSettings>) => void;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Logos and Visual Assets */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Brand Identity & Logos</h3>
            <p className="text-xs text-gray-500">
              Upload custom logo files or preserve the built-in gold star vector identity
            </p>
          </div>
        </div>

        {/* Live Logo Preview Card */}
        <div className="mb-6 p-4 rounded-xl bg-gray-900 text-white border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#FFE5A3] block mb-1">
              Live Header & Footer Preview
            </span>
            <p className="text-xs text-gray-400">
              {data.logo
                ? "Custom logo image is active."
                : "Default Celebrity Bulaye gold emblem & wordmark is active."}
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-center min-w-[200px]">
            <Logo variant="light" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Logo */}
          <div className="md:col-span-1">
            <ImageUploadField
              label="Primary Logo (Header)"
              description="Displays in the top navigation bar. Transparent PNG or SVG recommended."
              recommendedSize="240x60 px"
              value={data.logo}
              onChange={(url) => onChange({ logo: url })}
              prefix="logo-main"
            />
          </div>

          {/* Footer Logo */}
          <div className="md:col-span-1">
            <ImageUploadField
              label="Footer / Inverted Logo"
              description="Used on dark backgrounds in the footer. If left empty, primary logo is used."
              recommendedSize="240x60 px"
              value={data.footerLogo}
              onChange={(url) => onChange({ footerLogo: url })}
              prefix="logo-footer"
            />
          </div>

          {/* Favicon */}
          <div className="md:col-span-2">
            <ImageUploadField
              label="Website Favicon"
              description="Displays in browser tabs and bookmarks. .ico, .png, or .svg"
              recommendedSize="32x32 or 64x64 px"
              value={data.favicon}
              onChange={(url) => onChange({ favicon: url })}
              prefix="favicon"
            />
          </div>
        </div>
      </div>

      {/* Brand Color Palette */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Brand Color Palette</h3>
            <p className="text-xs text-gray-500">
              Celebrity Bulaye core signature colors (Burgundy, Noir, Royal Gold)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Primary Color */}
          <div className="space-y-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
            <label className="text-xs font-semibold text-gray-800 block">
              Primary Brand Color (Burgundy Red)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white"
              />
              <input
                type="text"
                value={data.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                placeholder="#9B111E"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:border-[#9B111E] outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400">Buttons, badges, active navigation items.</p>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
            <label className="text-xs font-semibold text-gray-800 block">
              Secondary Color (Dark Noir / Slate)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.secondaryColor}
                onChange={(e) => onChange({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white"
              />
              <input
                type="text"
                value={data.secondaryColor}
                onChange={(e) => onChange({ secondaryColor: e.target.value })}
                placeholder="#0B0F19"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:border-[#9B111E] outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400">Footer background, hero base, dark cards.</p>
          </div>

          {/* Accent Gold Color */}
          <div className="space-y-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
            <label className="text-xs font-semibold text-gray-800 block">
              Accent Color (Royal Champagne Gold)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.accentGoldColor}
                onChange={(e) => onChange({ accentGoldColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white"
              />
              <input
                type="text"
                value={data.accentGoldColor}
                onChange={(e) => onChange({ accentGoldColor: e.target.value })}
                placeholder="#C5A059"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:border-[#9B111E] outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400">Stars, premium gradient badges, highlights.</p>
          </div>
        </div>

        {/* Brand Color Presets */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            Official Brand Presets:
          </span>
          <button
            type="button"
            onClick={() =>
              onChange({
                primaryColor: "#9B111E",
                secondaryColor: "#0B0F19",
                accentGoldColor: "#C5A059",
              })
            }
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors"
          >
            Celebrity Bulaye Signature (Classic)
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                primaryColor: "#B91C1C",
                secondaryColor: "#111827",
                accentGoldColor: "#D4AF37",
              })
            }
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors"
          >
            Vibrant Gala Gold
          </button>
        </div>
      </div>
    </div>
  );
};
