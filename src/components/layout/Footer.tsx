"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import { FacebookIcon, InstagramIcon, YouTubeIcon, LinkedInIcon } from "@/components/common/SocialIcons";
import { Logo } from "@/components/common/Logo";
import { useCategories } from "@/hooks/useCategories";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { VisitorCounter } from "@/components/layout/VisitorCounter";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { activeCategories } = useCategories();
  const { settings } = useSiteSettings();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const {
    footerDescription,
    copyrightText,
    showSocialLinks = true,
    showContactInfo = true,
    showCategoryLinks = true,
    showQuickLinks = true,
  } = settings.footer;

  const desc = footerDescription || settings.general.description;
  const copyright = copyrightText || settings.general.copyrightText || "© 2026 Celebrity Bulaye. All Rights Reserved.";

  const hasSocial =
    showSocialLinks &&
    (settings.social.facebook ||
      settings.social.instagram ||
      settings.social.youtube ||
      settings.social.linkedin ||
      settings.social.twitter);

  return (
    <footer className="bg-[#0B0F19] text-gray-300 border-t border-gray-800">
      {/* Upper Footer / Value Proposition */}
      <div className="border-b border-gray-800/80 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800/50 flex items-center justify-center text-[#FFE5A3] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Verified Talents</h4>
                <p className="text-xs text-gray-400">Direct management contracts with zero intermediaries</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800/50 flex items-center justify-center text-[#FFE5A3] shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Full Event Concierge</h4>
                <p className="text-xs text-gray-400">Riders, security, stage coordination & travel management</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800/50 flex items-center justify-center text-[#FFE5A3] shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">24/7 Booking Desk</h4>
                <p className="text-xs text-gray-400">Rapid response and transparent quote within hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="text-xs leading-relaxed text-gray-400">
              {desc}
            </p>
            {hasSocial && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-white block mb-3 uppercase tracking-wider">
                  Follow Our Network
                </span>
                <div className="flex items-center gap-2.5">
                  {settings.social.facebook && (
                    <a
                      href={settings.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-[#9B111E] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
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
                      className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-[#9B111E] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
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
                      className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-[#9B111E] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <YouTubeIcon className="w-4 h-4" />
                    </a>
                  )}
                  {settings.social.linkedin && (
                    <a
                      href={settings.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-[#9B111E] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          {showQuickLinks && (
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C5A059] pl-2.5">
                Quick Links
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="hover:text-white hover:underline transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white hover:underline transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/book-celebrity" className="hover:text-white hover:underline transition-colors">
                    Book Celebrity
                  </Link>
                </li>
                <li>
                  <Link href="/join-us" className="hover:text-white hover:underline transition-colors">
                    Join Us (For Artists)
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white hover:underline transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/book-celebrity?sort=featured" className="hover:text-white hover:underline transition-colors">
                    Featured Artists
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Column 3: Celebrity Categories */}
          {showCategoryLinks && (
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C5A059] pl-2.5">
                Celebrity Categories
              </h3>
              <ul className="space-y-2 text-xs">
                {activeCategories.slice(0, 8).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="hover:text-white hover:underline transition-colors flex items-center justify-between group"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-gray-400">
                        {cat.displayCount || `${cat.count}+`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 4: Contact & Office */}
          {showContactInfo && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C5A059] pl-2.5">
                Headquarters
              </h3>
              <div className="space-y-3 text-xs text-gray-400">
                {settings.contact.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                    <span>
                      {settings.contact.address}
                      {settings.contact.city ? `, ${settings.contact.city}` : ""}
                      {settings.contact.state ? `, ${settings.contact.state}` : ""}
                      {settings.contact.postalCode ? ` ${settings.contact.postalCode}` : ""}
                    </span>
                  </div>
                )}
                {settings.contact.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <a
                      href={`tel:${settings.contact.phone.replace(/[^0-9+]/g, "")}`}
                      className="hover:text-white font-medium"
                    >
                      {settings.contact.phone}
                    </a>
                  </div>
                )}
                {settings.contact.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <a href={`mailto:${settings.contact.email}`} className="hover:text-white truncate">
                      {settings.contact.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg">
                  <span className="text-[11px] font-semibold text-[#FFE5A3] block">
                    Urgent Booking Inquiry?
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Our direct line is available 24/7 for VIP and event requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-gray-800 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          {/* Left: Copyright & Manshi Group of Services Credit */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left">
            <p>{copyright}</p>
            <span className="hidden sm:inline text-gray-700">|</span>
            <p className="text-gray-400">
              Design &amp; Developed by{" "}
              <a
                href="https://manshigroup.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white font-medium underline underline-offset-2 decoration-gray-600 hover:decoration-white transition-colors"
              >
                Manshi Group of Services
              </a>
            </p>
          </div>

          {/* Center: Dynamic Visitor Counter */}
          <div className="flex items-center justify-center">
            <VisitorCounter />
          </div>

          {/* Right: Legal Links */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-gray-300 transition-colors">
              Refund / Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
