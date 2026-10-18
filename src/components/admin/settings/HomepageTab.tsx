"use client";

import React from "react";
import { HomepageSettings, HomepageTrustStat } from "@/types/settings";
import { Sparkles, BarChart3, Layers, CheckSquare, Square } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";

interface HomepageTabProps {
  data: HomepageSettings;
  onChange: (updated: Partial<HomepageSettings>) => void;
}

export const HomepageTab: React.FC<HomepageTabProps> = ({ data, onChange }) => {
  const updateHero = (field: string, val: string) => {
    onChange({
      hero: {
        ...data.hero,
        [field]: val,
      },
    });
  };

  const updateStat = (key: "stat1" | "stat2" | "stat3" | "stat4", stat: Partial<HomepageTrustStat>) => {
    onChange({
      trustStats: {
        ...data.trustStats,
        [key]: {
          ...data.trustStats[key],
          ...stat,
        },
      },
    });
  };

  const toggleSection = (sectionKey: keyof typeof data.sections) => {
    onChange({
      sections: {
        ...data.sections,
        [sectionKey]: !data.sections[sectionKey],
      },
    });
  };

  const sectionToggles: Array<{
    key: keyof typeof data.sections;
    title: string;
    description: string;
  }> = [
    {
      key: "popularCategories",
      title: "Popular Categories",
      description: "Category grid showing Actor, Singer, Comedian, Sports with images.",
    },
    {
      key: "featuredCelebrities",
      title: "Featured Celebrities Carousel",
      description: "High-priority verified celebrities with quick inquiry actions.",
    },
    {
      key: "howItWorks",
      title: "How It Works (3 Steps)",
      description: "Visual roadmap of Select Artist, Receive Quote & Confirm Booking.",
    },
    {
      key: "whyChooseUs",
      title: "Why Celebrity Bulaye",
      description: "Trust badges: 100% verified, legal contracts, concierge logistics.",
    },
    {
      key: "eventTypes",
      title: "Event Types We Cater",
      description: "Weddings, Corporate Galas, College Fests, Concerts & Private Parties.",
    },
    {
      key: "trendingCelebrities",
      title: "Trending Celebrities",
      description: "Fastest-booking artists and trending entertainers across India.",
    },
    {
      key: "testimonials",
      title: "Client Testimonials & Reviews",
      description: "Verified organizer reviews and corporate wedding planner feedback.",
    },
    {
      key: "ctaSection",
      title: "Main Call-To-Action Banner",
      description: "High-impact banner prompting organizers to book a celebrity today.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero Section Management */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Hero Section Content</h3>
            <p className="text-xs text-gray-500">
              Customize the prominent top banner text, background visual, and call-to-action buttons
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Eyebrow */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-800">
              Hero Eyebrow / Small Pill Label
            </label>
            <input
              type="text"
              value={data.hero.eyebrow}
              onChange={(e) => updateHero("eyebrow", e.target.value)}
              placeholder="Premium Celebrity Booking Platform"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Heading */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-800">
              Hero Main Heading
            </label>
            <input
              type="text"
              value={data.hero.heading}
              onChange={(e) => updateHero("heading", e.target.value)}
              placeholder="Book Your Favorite Celebrity"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
            <p className="text-[11px] text-gray-400">
              The last word is automatically highlighted with a champagne gold gradient.
            </p>
          </div>

          {/* Supporting Text */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-800">
              Hero Supporting Subtitle
            </label>
            <textarea
              rows={3}
              value={data.hero.supportingText}
              onChange={(e) => updateHero("supportingText", e.target.value)}
              placeholder="Connect directly with verified Bollywood stars, playback singers, stand-up comedians, top influencers, and sports icons..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Background Image */}
          <div className="md:col-span-2">
            <ImageUploadField
              label="Hero Background Image"
              description="High-resolution panoramic concert or gala background. Cinematic dark overlay is applied automatically."
              recommendedSize="1920x1080 px"
              value={data.hero.backgroundImage}
              onChange={(url) => updateHero("backgroundImage", url)}
              prefix="hero-bg"
            />
          </div>

          {/* Primary Button Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Primary Button Label
            </label>
            <input
              type="text"
              value={data.hero.primaryButtonText}
              onChange={(e) => updateHero("primaryButtonText", e.target.value)}
              placeholder="Book a Celebrity"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Primary Button Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Primary Button Destination Link
            </label>
            <input
              type="text"
              value={data.hero.primaryButtonLink}
              onChange={(e) => updateHero("primaryButtonLink", e.target.value)}
              placeholder="/book-celebrity"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Secondary Button Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Secondary Button Label
            </label>
            <input
              type="text"
              value={data.hero.secondaryButtonText}
              onChange={(e) => updateHero("secondaryButtonText", e.target.value)}
              placeholder="Explore Categories"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Secondary Button Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Secondary Button Destination Link
            </label>
            <input
              type="text"
              value={data.hero.secondaryButtonLink}
              onChange={(e) => updateHero("secondaryButtonLink", e.target.value)}
              placeholder="#categories-section"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Trust Statistics Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Homepage Trust Statistics</h3>
            <p className="text-xs text-gray-500">
              Update the 4 prominent proof figures displayed beneath the hero section
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Celebrities */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Statistic 1 (Artists)
            </span>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Value</label>
              <input
                type="text"
                value={data.trustStats.stat1.value}
                onChange={(e) => updateStat("stat1", { value: e.target.value })}
                placeholder="500+"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Label</label>
              <input
                type="text"
                value={data.trustStats.stat1.label}
                onChange={(e) => updateStat("stat1", { label: e.target.value })}
                placeholder="Celebrities"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Sub-caption</label>
              <input
                type="text"
                value={data.trustStats.stat1.sub}
                onChange={(e) => updateStat("stat1", { sub: e.target.value })}
                placeholder="Direct Artist Network"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 focus:border-[#9B111E] outline-none"
              />
            </div>
          </div>

          {/* Stat 2: Successful Bookings */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Statistic 2 (Bookings)
            </span>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Value</label>
              <input
                type="text"
                value={data.trustStats.stat2.value}
                onChange={(e) => updateStat("stat2", { value: e.target.value })}
                placeholder="1000+"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Label</label>
              <input
                type="text"
                value={data.trustStats.stat2.label}
                onChange={(e) => updateStat("stat2", { label: e.target.value })}
                placeholder="Successful Bookings"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Sub-caption</label>
              <input
                type="text"
                value={data.trustStats.stat2.sub}
                onChange={(e) => updateStat("stat2", { sub: e.target.value })}
                placeholder="Pan-India & Global"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 focus:border-[#9B111E] outline-none"
              />
            </div>
          </div>

          {/* Stat 3: Cities */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Statistic 3 (Destinations)
            </span>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Value</label>
              <input
                type="text"
                value={data.trustStats.stat3.value}
                onChange={(e) => updateStat("stat3", { value: e.target.value })}
                placeholder="50+"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Label</label>
              <input
                type="text"
                value={data.trustStats.stat3.label}
                onChange={(e) => updateStat("stat3", { label: e.target.value })}
                placeholder="Cities"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Sub-caption</label>
              <input
                type="text"
                value={data.trustStats.stat3.sub}
                onChange={(e) => updateStat("stat3", { sub: e.target.value })}
                placeholder="Event Destinations"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 focus:border-[#9B111E] outline-none"
              />
            </div>
          </div>

          {/* Stat 4: Booking Assistance */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Statistic 4 (Support)
            </span>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Value</label>
              <input
                type="text"
                value={data.trustStats.stat4.value}
                onChange={(e) => updateStat("stat4", { value: e.target.value })}
                placeholder="24/7"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Label</label>
              <input
                type="text"
                value={data.trustStats.stat4.label}
                onChange={(e) => updateStat("stat4", { label: e.target.value })}
                placeholder="Booking Assistance"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#9B111E] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Sub-caption</label>
              <input
                type="text"
                value={data.trustStats.stat4.sub}
                onChange={(e) => updateStat("stat4", { sub: e.target.value })}
                placeholder="Dedicated Talent Managers"
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 focus:border-[#9B111E] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured Section Visibility Toggles */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Featured Homepage Sections</h3>
            <p className="text-xs text-gray-500">
              Toggle specific sections on or off to adjust the homepage flow without modifying code
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {sectionToggles.map((sec) => {
            const isEnabled = !!data.sections[sec.key];

            return (
              <div
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isEnabled
                    ? "border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50"
                    : "border-gray-200 bg-gray-50/40 hover:bg-gray-100/60 opacity-70"
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    {isEnabled ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <span>{sec.title}</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 pl-5.5 leading-tight">
                    {sec.description}
                  </p>
                </div>

                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 mt-0.5 ${
                    isEnabled ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
