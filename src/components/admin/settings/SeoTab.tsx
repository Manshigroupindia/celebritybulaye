"use client";

import React from "react";
import { SeoSettings } from "@/types/settings";
import { Search, Share2, Globe, Image as ImageIcon } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";
import Image from "next/image";

interface SeoTabProps {
  data: SeoSettings;
  onChange: (updated: Partial<SeoSettings>) => void;
}

export const SeoTab: React.FC<SeoTabProps> = ({ data, onChange }) => {
  const titleLen = (data.defaultTitle || "").length;
  const descLen = (data.defaultMetaDescription || "").length;

  return (
    <div className="space-y-6">
      {/* 1. Core Search Engine Metadata */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Search Engine Optimization (SEO)</h3>
            <p className="text-xs text-gray-500">
              Default title, meta description, and keywords for search crawlers
            </p>
          </div>
        </div>

        {/* Live Google Search Snippet Simulation */}
        <div className="mb-6 p-4 rounded-xl bg-gray-50/80 border border-gray-200 space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>https://celebritybulaye.com</span>
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-blue-800 hover:underline cursor-pointer truncate font-sans">
            {data.defaultTitle || "Celebrity Bulaye — Book Bollywood Stars, Singers & Influencers"}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {data.defaultMetaDescription ||
              "India's premier verified celebrity booking platform. Connect directly with Bollywood actors, playback singers, stand-up comedians, top influencers, and sports icons."}
          </p>
        </div>

        <div className="space-y-5">
          {/* Default SEO Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800">
                Default Meta Title
              </label>
              <span
                className={`text-[11px] font-medium ${
                  titleLen > 60
                    ? "text-amber-600 font-bold"
                    : titleLen >= 40
                    ? "text-emerald-600 font-bold"
                    : "text-gray-400"
                }`}
              >
                {titleLen} / 60 chars {titleLen > 60 ? "(Too long)" : "(Recommended: 50-60)"}
              </span>
            </div>
            <input
              type="text"
              value={data.defaultTitle}
              onChange={(e) => onChange({ defaultTitle: e.target.value })}
              placeholder="Celebrity Bulaye — Book Bollywood Stars, Singers & Influencers"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Default Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800">
                Default Meta Description
              </label>
              <span
                className={`text-[11px] font-medium ${
                  descLen > 160
                    ? "text-amber-600 font-bold"
                    : descLen >= 120
                    ? "text-emerald-600 font-bold"
                    : "text-gray-400"
                }`}
              >
                {descLen} / 160 chars {descLen > 160 ? "(Too long)" : "(Recommended: 150-160)"}
              </span>
            </div>
            <textarea
              rows={3}
              value={data.defaultMetaDescription}
              onChange={(e) => onChange({ defaultMetaDescription: e.target.value })}
              placeholder="India's premier verified celebrity booking platform..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Default Keywords */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Default Meta Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={data.defaultKeywords}
              onChange={(e) => onChange({ defaultKeywords: e.target.value })}
              placeholder="celebrity booking, book bollywood stars, wedding singers, hire comedian, celebrity bulaye"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Open Graph / Social Sharing Metadata */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Social Share Cards (Open Graph)</h3>
            <p className="text-xs text-gray-500">
              Previews generated when links are shared on WhatsApp, Facebook, LinkedIn, and X
            </p>
          </div>
        </div>

        {/* Social Share Card Preview */}
        <div className="mb-6 p-4 rounded-2xl bg-gray-900 text-white border border-gray-800 max-w-md mx-auto sm:mx-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            Social Card Preview
          </span>
          <div className="rounded-xl overflow-hidden bg-black/60 border border-gray-700">
            {data.ogImage ? (
              <div className="relative aspect-1.91/1 w-full bg-gray-800">
                <Image
                  src={data.ogImage}
                  alt="Open Graph Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="aspect-1.91/1 w-full bg-gray-800 flex items-center justify-center text-gray-500">
                <ImageIcon className="w-8 h-8 opacity-40" />
              </div>
            )}
            <div className="p-3 bg-gray-900">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                celebritybulaye.com
              </span>
              <h5 className="text-xs font-bold text-white mt-0.5 line-clamp-1">
                {data.ogTitle || data.defaultTitle || "Celebrity Bulaye — Book Verified Celebrities"}
              </h5>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                {data.ogDescription || data.defaultMetaDescription || "Direct access to top Bollywood actors, playback singers & influencers."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* OG Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Open Graph Title
            </label>
            <input
              type="text"
              value={data.ogTitle}
              onChange={(e) => onChange({ ogTitle: e.target.value })}
              placeholder="Celebrity Bulaye — Book Verified Celebrities"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* OG Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Open Graph Description
            </label>
            <textarea
              rows={2}
              value={data.ogDescription}
              onChange={(e) => onChange({ ogDescription: e.target.value })}
              placeholder="Direct access to top Bollywood actors, playback singers, comedians & influencers for private & corporate events."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* OG Image */}
          <div>
            <ImageUploadField
              label="Open Graph Image (1200x630)"
              description="Visual banner shown when sharing links on WhatsApp, iMessage, Twitter, and Facebook."
              recommendedSize="1200x630 px"
              value={data.ogImage}
              onChange={(url) => onChange({ ogImage: url })}
              prefix="og-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
