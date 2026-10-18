"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronDown, ChevronRight, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useCategories } from "@/hooks/useCategories";
import { siteSettings } from "@/data/siteSettings";
import { GoogleTranslate } from "@/components/layout/GoogleTranslate";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Book Celebrity", href: "/book-celebrity" },
  { name: "Join Us", href: "/join-us" },
  { name: "Contact Us", href: "/contact" },
];

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { activeCategories } = useCategories();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setExpandedCat(expandedCat === catId ? null : catId);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Main Links */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Menu
            </span>
            <div className="space-y-1">
              {mainLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={onClose}
                    className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-red-50 text-[#9B111E]"
                        : "text-gray-800 hover:bg-gray-50 hover:text-[#9B111E]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Categories Accordion */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Explore Categories
            </span>
            <div className="space-y-1 divide-y divide-gray-100">
              {activeCategories.map((cat) => {
                const activeSubs = (cat.subcategories || []).filter(
                  (s) => (s.status ?? "active") === "active"
                );
                const hasSub = activeSubs.length > 0;
                const isExpanded = expandedCat === cat.id;

                return (
                  <div key={cat.id} className="pt-1.5 first:pt-0">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={onClose}
                        className="text-xs font-semibold text-gray-800 hover:text-[#9B111E] py-1.5"
                      >
                        {cat.name}
                      </Link>
                      {hasSub && (
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          aria-label={`Toggle ${cat.name} subcategories`}
                          className="p-1.5 text-gray-400 hover:text-gray-700"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasSub && isExpanded && (
                      <div className="pl-3 py-1 space-y-1 border-l-2 border-red-200 ml-1 mb-2">
                        {activeSubs.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${cat.slug}/${sub.slug}`}
                            onClick={onClose}
                            className="flex items-center justify-between text-xs text-gray-600 hover:text-[#9B111E] py-1"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Language Selector */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Language
            </span>
            <GoogleTranslate />
          </div>

          {/* Fast Contact info */}
          <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 border border-gray-100 text-xs">
            <div className="font-semibold text-gray-800">Booking Hotline</div>
            <a
              href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-2 text-gray-600 hover:text-[#9B111E]"
            >
              <Phone className="w-3.5 h-3.5 text-[#9B111E]" />
              <span>{siteSettings.phone}</span>
            </a>
            <a
              href={`mailto:${siteSettings.email}`}
              className="flex items-center gap-2 text-gray-600 hover:text-[#9B111E]"
            >
              <Mail className="w-3.5 h-3.5 text-[#9B111E]" />
              <span className="truncate">{siteSettings.email}</span>
            </a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <Link
            href="/book-celebrity"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-lg shadow-md transition-colors"
          >
            Book a Celebrity
          </Link>
        </div>
      </div>
    </div>
  );
};
