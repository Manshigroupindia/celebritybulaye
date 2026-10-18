"use client";

import React from "react";
import { LocalizationSettings } from "@/types/settings";
import { Languages, Globe, CheckSquare, Square, Info } from "lucide-react";

interface LocalizationTabProps {
  data: LocalizationSettings;
  onChange: (updated: Partial<LocalizationSettings>) => void;
}

const allLanguages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
];

export const LocalizationTab: React.FC<LocalizationTabProps> = ({
  data,
  onChange,
}) => {
  const toggleLanguage = (code: string) => {
    const current = data.supportedLanguages || [];
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    onChange({ supportedLanguages: updated });
  };

  return (
    <div className="space-y-6">
      {/* Language Selector Control */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Multilingual & Localization</h3>
            <p className="text-xs text-gray-500">
              Control the header language switcher and active regional languages
            </p>
          </div>
        </div>

        {/* Enable Language Switcher Toggle */}
        <div
          onClick={() =>
            onChange({ enableLanguageSelector: !data.enableLanguageSelector })
          }
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 mb-6 ${
            data.enableLanguageSelector
              ? "border-emerald-200 bg-emerald-50/40"
              : "border-gray-200 bg-gray-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-xs">
              G
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                Display Language Selector in Header
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                When enabled, visitors will see the Google Translate switcher next to search in the main navigation.
              </p>
            </div>
          </div>

          <div
            className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
              data.enableLanguageSelector ? "bg-emerald-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                data.enableLanguageSelector ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>

        {/* Default Language Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Default Website Language
            </label>
            <select
              value={data.defaultLanguage}
              onChange={(e) => onChange({ defaultLanguage: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            >
              {allLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.native})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400">
              Primary fallback language for UI text and initial visitor sessions.
            </p>
          </div>
        </div>

        {/* Translation Status Notice */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-blue-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">Translation Architecture Status</span>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              Celebrity Bulaye includes a clean integration-ready Google Translate dropdown. Real-time translation hooks are configured so that when your team adds your Google Translate API credentials, the site will translate dynamically without requiring code restructuring.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Languages Checklist */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Supported Regional Languages</h3>
            <p className="text-xs text-gray-500">
              Select which Indian regional languages to offer in the translation selector
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allLanguages.map((lang) => {
            const isSupported = (data.supportedLanguages || []).includes(lang.code);

            return (
              <div
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  isSupported
                    ? "border-emerald-200 bg-emerald-50/40 text-gray-900"
                    : "border-gray-200 bg-gray-50/40 text-gray-500 opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">{lang.name}</span>
                  <span className="text-[10px] text-gray-400 block">{lang.native}</span>
                </div>
                {isSupported ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
