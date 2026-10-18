"use client";

import React, { useState } from "react";
import { GeneralSettings } from "@/types/settings";
import { AlertTriangle, Globe, ShieldCheck, Clock, DollarSign, Flag } from "lucide-react";

interface GeneralTabProps {
  data: GeneralSettings;
  onChange: (updated: Partial<GeneralSettings>) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ data, onChange }) => {
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const handleStatusClick = (status: "active" | "maintenance") => {
    if (status === "maintenance" && data.websiteStatus !== "maintenance") {
      setShowMaintenanceModal(true);
    } else {
      onChange({ websiteStatus: status });
    }
  };

  const confirmMaintenanceMode = () => {
    onChange({ websiteStatus: "maintenance" });
    setShowMaintenanceModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Basic Site Identity */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Website Identity</h3>
            <p className="text-xs text-gray-500">Public name, tagline, and metadata bio for Celebrity Bulaye</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Website Name */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-gray-800">
              Website Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.siteName}
              onChange={(e) => onChange({ siteName: e.target.value })}
              placeholder="Celebrity Bulaye"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">Used in header, logo text fallback, emails, and browser title bar.</p>
          </div>

          {/* Website URL */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-gray-800">
              Canonical Website URL
            </label>
            <input
              type="url"
              value={data.siteUrl}
              onChange={(e) => onChange({ siteUrl: e.target.value })}
              placeholder="https://celebritybulaye.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">Primary domain URL. Leave empty until production domain is configured.</p>
          </div>

          {/* Website Tagline */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-800">
              Website Tagline
            </label>
            <input
              type="text"
              value={data.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="India's Premier Verified Celebrity Booking & Talent Management Platform"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] outline-none transition-colors"
            />
          </div>

          {/* Website Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-800">
              Website Description / Short Bio
            </label>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Connect directly with verified Bollywood stars, playback singers, stand-up comedians, top influencers, and sports icons for weddings, corporate galas, concerts, brand collaborations, and private celebrations."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">Default description for homepage search previews and footer introduction.</p>
          </div>
        </div>
      </div>

      {/* Section 2: Regional & Operational Defaults */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Regional & System Standards</h3>
            <p className="text-xs text-gray-500">Country, time zone, default currency, and legal copyright</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Default Country */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">Default Country</label>
            <div className="relative">
              <input
                type="text"
                value={data.defaultCountry}
                onChange={(e) => onChange({ defaultCountry: e.target.value })}
                placeholder="India"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
              />
            </div>
          </div>

          {/* Default Time Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Default Time Zone</span>
            </label>
            <input
              type="text"
              value={data.defaultTimeZone}
              onChange={(e) => onChange({ defaultTimeZone: e.target.value })}
              placeholder="Asia/Kolkata (IST)"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Default Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
              <span>Default Currency</span>
            </label>
            <input
              type="text"
              value={data.defaultCurrency}
              onChange={(e) => onChange({ defaultCurrency: e.target.value })}
              placeholder="INR (₹)"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Copyright Text */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-semibold text-gray-800">
              Copyright Notice Text
            </label>
            <input
              type="text"
              value={data.copyrightText}
              onChange={(e) => onChange({ copyrightText: e.target.value })}
              placeholder="© 2026 Celebrity Bulaye. All Rights Reserved."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
            <p className="text-[11px] text-gray-400">Displayed in footer copyright bar across all public pages.</p>
          </div>
        </div>
      </div>

      {/* Section 3: Website Status & Maintenance */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Website Availability Status</h3>
            <p className="text-xs text-gray-500">Control public website access during updates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Card */}
          <div
            onClick={() => handleStatusClick("active")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              data.websiteStatus === "active"
                ? "border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live / Active Mode
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                data.websiteStatus === "active"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {data.websiteStatus === "active" ? "CURRENT" : "SELECT"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              The website is publicly accessible. Inquiries, artist catalog, and bookings operate normally.
            </p>
          </div>

          {/* Maintenance Card */}
          <div
            onClick={() => handleStatusClick("maintenance")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              data.websiteStatus === "maintenance"
                ? "border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-500"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Maintenance Mode
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                data.websiteStatus === "maintenance"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {data.websiteStatus === "maintenance" ? "ACTIVE" : "SELECT"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Displays a prominent maintenance banner to public visitors. Admin panel remains 100% accessible.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Maintenance Mode */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Enable Website Maintenance Mode?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              When Maintenance Mode is active, visitors to Celebrity Bulaye will see a maintenance notice banner informing them of scheduled updates.
              <br /><br />
              <strong className="text-gray-800">You will NOT be locked out.</strong> The Admin CMS remains completely operational.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMaintenanceMode}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                Confirm Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
