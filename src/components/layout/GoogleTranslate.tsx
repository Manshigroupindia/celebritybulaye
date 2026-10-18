"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Globe, Check, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export interface Language {
  code: string;
  name: string;
  native: string;
}

export const languages: Language[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
];

const LANGUAGE_CHANGE_EVENT = "cb_language_changed";

/**
 * Extract active language code from Google Translate cookies
 */
function getActiveLangFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return null;
  const raw = decodeURIComponent(match[1]); // e.g. "/en/hi"
  const parts = raw.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

/**
 * Set or clear Google Translate cookie across all domain variants
 */
function setGoogleTranslateCookie(langCode: string) {
  if (typeof document === "undefined") return;

  if (langCode === "en") {
    // Expire cookies to return to original English
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  } else {
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;
  }
}

/**
 * Dispatch language selection to Google Translate hidden selector
 */
function triggerGoogleTranslate(langCode: string) {
  setGoogleTranslateCookie(langCode);

  const apply = () => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      if (langCode === "en") {
        const enOpt = Array.from(select.options).find((o) => o.value === "en");
        select.value = enOpt ? "en" : "";
      } else {
        select.value = langCode;
      }
      select.dispatchEvent(new Event("change"));
      return true;
    }
    return false;
  };

  if (!apply()) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (apply() || attempts > 25) {
        clearInterval(interval);
      }
    }, 120);
  }
}

/**
 * Ensure Google Translate script and target element exist
 */
function initGoogleTranslateScript(onError: () => void) {
  if (typeof window === "undefined") return;

  // Ensure DOM container exists
  if (!document.getElementById("google_translate_element")) {
    const el = document.createElement("div");
    el.id = "google_translate_element";
    document.body.appendChild(el);
  }

  // Setup global init callback
  const win = window as unknown as {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string
        ) => void;
      };
    };
  };

  if (!win.googleTranslateElementInit) {
    win.googleTranslateElementInit = () => {
      try {
        if (win.google?.translate?.TranslateElement) {
          new win.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,pa,bn,mr,gu,ta,te",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      } catch (err) {
        console.warn("[GoogleTranslate] Initialization notice:", err);
      }
    };
  }

  // Append script tag only once
  if (!document.getElementById("google-translate-script")) {
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.warn("[GoogleTranslate] Script could not be reached. Local translator fallback active.");
      onError();
    };
    document.body.appendChild(script);
  }
}

export const GoogleTranslate: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(languages[0]);
  const [isTranslating, setIsTranslating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize script and sync with existing cookie
  useEffect(() => {
    initGoogleTranslateScript(() => {
      // Graceful error handler
      setIsTranslating(false);
    });

    const activeCode = getActiveLangFromCookie();
    if (activeCode) {
      const match = languages.find((l) => l.code === activeCode);
      if (match) {
        setSelectedLang(match);
      }
    }
  }, []);

  // Listen for language changes from other components (desktop vs mobile sync)
  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      if (customEvent.detail && customEvent.detail.code !== selectedLang.code) {
        setSelectedLang(customEvent.detail);
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleSync);
  }, [selectedLang.code]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Preserve active translation on Next.js client-side route transitions
  useEffect(() => {
    if (selectedLang.code !== "en") {
      const timeout = setTimeout(() => {
        triggerGoogleTranslate(selectedLang.code);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [pathname, selectedLang.code]);

  const handleSelect = useCallback(
    (lang: Language) => {
      setSelectedLang(lang);
      setIsOpen(false);
      setIsTranslating(true);

      // Broadcast to other translator components (e.g. mobile drawer & desktop top bar)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent<Language>(LANGUAGE_CHANGE_EVENT, { detail: lang })
        );
      }

      // Trigger Google Translate engine
      triggerGoogleTranslate(lang.code);

      setTimeout(() => {
        setIsTranslating(false);
      }, 600);
    },
    []
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors shadow-2xs"
      >
        {/* Google 'G' icon badge */}
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white shadow-xs font-semibold text-[10px] text-blue-600 shrink-0">
          G
        </span>

        {isTranslating ? (
          <span className="flex items-center gap-1 text-gray-500 font-medium">
            <Loader2 className="w-3 h-3 animate-spin text-[#9B111E]" />
            <span className="truncate max-w-[85px]">{selectedLang.name}</span>
          </span>
        ) : (
          <span className="font-medium truncate max-w-[100px]">
            {selectedLang.code === "en" ? "Select Language" : selectedLang.name}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 flex items-center justify-between">
            <span>Powered by Google</span>
            <Globe className="w-3 h-3 text-gray-400" />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {languages.map((lang) => {
              const isSelected = selectedLang.code === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                    isSelected
                      ? "text-[#9B111E] font-semibold bg-red-50/50"
                      : "text-gray-700"
                  }`}
                >
                  <div>
                    <span className="block leading-tight">{lang.name}</span>
                    <span className="text-[10px] text-gray-400 leading-tight">
                      {lang.native}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#9B111E] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
