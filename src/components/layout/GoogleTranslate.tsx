"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";

interface Language {
  code: string;
  name: string;
  native: string;
}

const languages: Language[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
];

export const GoogleTranslate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setSelectedLang(lang);
    setIsOpen(false);
    // Prepared hook for Google Translate script initialization in future:
    if (typeof window !== "undefined" && (window as unknown as { doGTranslate?: (pair: string) => void }).doGTranslate) {
      (window as unknown as { doGTranslate: (pair: string) => void }).doGTranslate(`en|${lang.code}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
      >
        {/* Google 'G' icon badge */}
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white shadow-xs font-semibold text-[10px] text-blue-600">
          G
        </span>
        <span className="font-medium truncate max-w-[100px]">
          {selectedLang.code === "en" ? "Select Language" : selectedLang.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 flex items-center justify-between">
            <span>Powered by Google</span>
            <Globe className="w-3 h-3 text-gray-400" />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-gray-50 transition-colors ${
                  selectedLang.code === lang.code ? "text-[#9B111E] font-semibold bg-red-50/50" : "text-gray-700"
                }`}
              >
                <div>
                  <span className="block">{lang.name}</span>
                  <span className="text-[10px] text-gray-400">{lang.native}</span>
                </div>
                {selectedLang.code === lang.code && <Check className="w-3.5 h-3.5 text-[#9B111E]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
