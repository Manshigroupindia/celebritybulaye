"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/common/SocialIcons";
import { Logo } from "@/components/common/Logo";
import { GoogleTranslate } from "@/components/layout/GoogleTranslate";
import { GlobalSearchDropdown } from "@/components/layout/GlobalSearchDropdown";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Book Celebrity", href: "/book-celebrity" },
  { name: "Join Us", href: "/join-us" },
  { name: "Contact Us", href: "/contact" },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();
  const { settings } = useSiteSettings();

  const hasSocial =
    settings.social.facebook ||
    settings.social.instagram ||
    settings.social.youtube;

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-20 gap-4">
          {/* LEFT: Logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* CENTER: Desktop Main Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    isActive
                      ? "text-[#9B111E] font-semibold"
                      : "text-gray-700 hover:text-[#9B111E]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9B111E] rounded-full animate-in fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Language, Search, Social, Mobile Hamburger */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Google Translate Selector (controlled by settings) */}
            {settings.localization.enableLanguageSelector && (
              <div className="hidden sm:block">
                <GoogleTranslate />
              </div>
            )}

            {/* Search Input / Dropdown */}
            <div className="hidden md:block">
              <GlobalSearchDropdown />
            </div>

            {/* Social Media Icons */}
            {hasSocial && (
              <div className="hidden xl:flex items-center gap-2 border-l border-gray-200 pl-3">
                {settings.social.facebook && (
                  <a
                    href={settings.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#9B111E] hover:bg-red-50 transition-colors"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {settings.social.instagram && (
                  <a
                    href={settings.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#9B111E] hover:bg-red-50 transition-colors"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {settings.social.youtube && (
                  <a
                    href={settings.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#9B111E] hover:bg-red-50 transition-colors"
                  >
                    <YouTubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open Navigation Menu"
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-[#9B111E] hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
