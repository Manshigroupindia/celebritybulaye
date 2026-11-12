"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Globe, Check, Loader2, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";

export interface Language {
  code: string;
  name: string;
  native: string;
}

export const languages: Language[] = [
  // Common / Indian & Regional Languages
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia (Oriya)", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "bho", name: "Bhojpuri", native: "भोजपुरी" },
  { code: "mai", name: "Maithili", native: "मैथिली" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "sd", name: "Sindhi", native: "سنڌي" },
  { code: "ne", name: "Nepali", native: "नेपाली" },
  { code: "gom", name: "Konkani", native: "कोंकणी" },
  { code: "doi", name: "Dogri", native: "डोगरी" },
  { code: "mni-Mtei", name: "Meiteilon (Manipuri)", native: "মৈতৈলোন্" },
  { code: "lus", name: "Mizo", native: "Mizo ṭawng" },

  // International & Global Languages
  { code: "af", name: "Afrikaans", native: "Afrikaans" },
  { code: "ak", name: "Akan (Twi)", native: "Twi" },
  { code: "sq", name: "Albanian", native: "Shqip" },
  { code: "am", name: "Amharic", native: "አማርኛ" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "hy", name: "Armenian", native: "Հայերեն" },
  { code: "ay", name: "Aymara", native: "Aymar aru" },
  { code: "az", name: "Azerbaijani", native: "Azərbaycan" },
  { code: "bm", name: "Bambara", native: "Bamanankan" },
  { code: "eu", name: "Basque", native: "Euskara" },
  { code: "be", name: "Belarusian", native: "Беларуская" },
  { code: "bs", name: "Bosnian", native: "Bosanski" },
  { code: "bg", name: "Bulgarian", native: "Български" },
  { code: "ca", name: "Catalan", native: "Català" },
  { code: "ceb", name: "Cebuano", native: "Cebuano" },
  { code: "zh-CN", name: "Chinese (Simplified)", native: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", native: "繁體中文" },
  { code: "co", name: "Corsican", native: "Corsu" },
  { code: "hr", name: "Croatian", native: "Hrvatski" },
  { code: "cs", name: "Czech", native: "Čeština" },
  { code: "da", name: "Danish", native: "Dansk" },
  { code: "dv", name: "Dhivehi", native: "ދިވެހި" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "eo", name: "Esperanto", native: "Esperanto" },
  { code: "et", name: "Estonian", native: "Eesti" },
  { code: "ee", name: "Ewe", native: "Eʋegbe" },
  { code: "tl", name: "Filipino (Tagalog)", native: "Tagalog" },
  { code: "fi", name: "Finnish", native: "Suomi" },
  { code: "fr", name: "French", native: "Français" },
  { code: "fy", name: "Frisian", native: "Frysk" },
  { code: "gl", name: "Galician", native: "Galego" },
  { code: "ka", name: "Georgian", native: "ქართული" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "el", name: "Greek", native: "Ελληνικά" },
  { code: "gn", name: "Guarani", native: "Avañeʼẽ" },
  { code: "ht", name: "Haitian Creole", native: "Kreyòl ayisyen" },
  { code: "ha", name: "Hausa", native: "Hausa" },
  { code: "haw", name: "Hawaiian", native: "ʻŌlelo Hawaiʻi" },
  { code: "he", name: "Hebrew", native: "עברית" },
  { code: "hmn", name: "Hmong", native: "Hmong" },
  { code: "hu", name: "Hungarian", native: "Magyar" },
  { code: "is", name: "Icelandic", native: "Íslenska" },
  { code: "ig", name: "Igbo", native: "Igbo" },
  { code: "ilo", name: "Ilocano", native: "Ilokano" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ga", name: "Irish", native: "Gaeilge" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "jv", name: "Javanese", native: "Basa Jawa" },
  { code: "kk", name: "Kazakh", native: "Қазақ тілі" },
  { code: "km", name: "Khmer", native: "ភាសាខ្មែរ" },
  { code: "rw", name: "Kinyarwanda", native: "Ikinyarwanda" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "kri", name: "Krio", native: "Krio" },
  { code: "ku", name: "Kurdish (Kurmanji)", native: "Kurdî" },
  { code: "ckb", name: "Kurdish (Sorani)", native: "سۆرانی" },
  { code: "ky", name: "Kyrgyz", native: "Кыргызча" },
  { code: "lo", name: "Lao", native: "ລາວ" },
  { code: "la", name: "Latin", native: "Latina" },
  { code: "lv", name: "Latvian", native: "Latviešu" },
  { code: "ln", name: "Lingala", native: "Lingála" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių" },
  { code: "lg", name: "Luganda", native: "Oluganda" },
  { code: "lb", name: "Luxembourgish", native: "Lëtzebuergesch" },
  { code: "mk", name: "Macedonian", native: "Македонски" },
  { code: "mg", name: "Malagasy", native: "Malagasy" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu" },
  { code: "mt", name: "Maltese", native: "Malti" },
  { code: "mi", name: "Maori", native: "Te Reo Māori" },
  { code: "mn", name: "Mongolian", native: "Монгол" },
  { code: "my", name: "Myanmar (Burmese)", native: "မြန်မာစာ" },
  { code: "no", name: "Norwegian", native: "Norsk" },
  { code: "om", name: "Oromo", native: "Afaan Oromoo" },
  { code: "ps", name: "Pashto", native: "پښتو" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "qu", name: "Quechua", native: "Runasimi" },
  { code: "ro", name: "Romanian", native: "Română" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "sm", name: "Samoan", native: "Gagana Samoa" },
  { code: "gd", name: "Scots Gaelic", native: "Gàidhlig" },
  { code: "nso", name: "Sepedi", native: "Sepedi" },
  { code: "sr", name: "Serbian", native: "Српски" },
  { code: "st", name: "Sesotho", native: "Sesotho" },
  { code: "sn", name: "Shona", native: "chiShona" },
  { code: "si", name: "Sinhala", native: "සිංහල" },
  { code: "sk", name: "Slovak", native: "Slovenčina" },
  { code: "sl", name: "Slovenian", native: "Slovenščina" },
  { code: "so", name: "Somali", native: "Soomaali" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "su", name: "Sundanese", native: "Basa Sunda" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "tg", name: "Tajik", native: "Тоҷикӣ" },
  { code: "tt", name: "Tatar", native: "Татарча" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "ti", name: "Tigrinya", native: "ትግርኛ" },
  { code: "ts", name: "Tsonga", native: "Xitsonga" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "tk", name: "Turkmen", native: "Türkmen" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "ug", name: "Uyghur", native: "ئۇيغۇرچە" },
  { code: "uz", name: "Uzbek", native: "Oʻzbek" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "cy", name: "Welsh", native: "Cymraeg" },
  { code: "xh", name: "Xhosa", native: "isiXhosa" },
  { code: "yi", name: "Yiddish", native: "ייִדיש" },
  { code: "yo", name: "Yoruba", native: "Yorùbá" },
  { code: "zu", name: "Zulu", native: "isiZulu" },
];

const LANGUAGE_CHANGE_EVENT = "cb_language_changed";

/**
 * Extract active language code from Google Translate cookies
 */
function getActiveLangFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return null;
  const raw = decodeURIComponent(match[1]); // e.g. "/en/hi" or "/auto/hi"
  const parts = raw.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

/**
 * Set or clear Google Translate cookie across root and host domain variants
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
        const enOpt = Array.from(select.options).find((o) => o.value === "en" || o.value === "");
        select.value = enOpt ? enOpt.value : "";
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
      if (apply() || attempts > 30) {
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

  // Setup global init callback (no includedLanguages filter, unlocks all 130+ languages)
  const win = window as unknown as {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: { pageLanguage: string; autoDisplay: boolean },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState<Language>(languages[0]);
  const [isTranslating, setIsTranslating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize script and sync with existing cookie
  useEffect(() => {
    initGoogleTranslateScript(() => {
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

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

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

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
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

  const handleSelect = useCallback((lang: Language) => {
    setSelectedLang(lang);
    setIsOpen(false);
    setIsTranslating(true);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<Language>(LANGUAGE_CHANGE_EVENT, { detail: lang })
      );
    }

    triggerGoogleTranslate(lang.code);

    setTimeout(() => {
      setIsTranslating(false);
    }, 600);
  }, []);

  // Filtered languages matching search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return languages;
    }
    const q = searchQuery.toLowerCase().trim();
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors shadow-2xs"
      >
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white shadow-xs font-semibold text-[10px] text-blue-600 shrink-0">
          G
        </span>

        {isTranslating ? (
          <span className="flex items-center gap-1 text-gray-500 font-medium">
            <Loader2 className="w-3 h-3 animate-spin text-[#9B111E]" />
            <span className="truncate max-w-[85px]">Translating...</span>
          </span>
        ) : (
          <span className="font-medium truncate max-w-[110px]">
            {selectedLang.code === "en" ? "Select Language" : selectedLang.name}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>Google Translate (130+ Languages)</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Free</span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language or script..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Language List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
            {filteredLanguages.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No matching language found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = selectedLang.code === lang.code;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                      isSelected
                        ? "text-[#9B111E] font-semibold bg-red-50/60"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-baseline gap-2 truncate">
                      <span className="font-medium text-gray-900 truncate">
                        {lang.name}
                      </span>
                      {lang.native !== lang.name && (
                        <span className="text-[10px] text-gray-400 font-normal truncate">
                          {lang.native}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#9B111E] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Status */}
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <span>Showing {filteredLanguages.length} of {languages.length} languages</span>
            <button
              type="button"
              onClick={() => handleSelect(languages[0])}
              className="text-[#9B111E] font-medium hover:underline"
            >
              Reset to English
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
