"use client";

import React from "react";
import { SocialSettings } from "@/types/settings";
import { Share2, ExternalLink } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/components/common/SocialIcons";

interface SocialTabProps {
  data: SocialSettings;
  onChange: (updated: Partial<SocialSettings>) => void;
}

export const SocialTab: React.FC<SocialTabProps> = ({ data, onChange }) => {
  const socialChannels = [
    {
      key: "instagram" as const,
      name: "Instagram Profile",
      icon: InstagramIcon,
      color: "text-pink-600 bg-pink-50 border-pink-200",
      placeholder: "https://instagram.com/celebritybulaye",
      hint: "Most popular for celebrity reels and behind-the-scenes event footage.",
    },
    {
      key: "facebook" as const,
      name: "Facebook Page",
      icon: FacebookIcon,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      placeholder: "https://facebook.com/celebritybulaye",
      hint: "Used for live streams, event photo albums, and company announcements.",
    },
    {
      key: "youtube" as const,
      name: "YouTube Channel",
      icon: YouTubeIcon,
      color: "text-red-600 bg-red-50 border-red-200",
      placeholder: "https://youtube.com/@celebritybulaye",
      hint: "Concert highlights, artist interviews, and client testimonials.",
    },
    {
      key: "linkedin" as const,
      name: "LinkedIn Company Page",
      icon: LinkedInIcon,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      placeholder: "https://linkedin.com/company/celebritybulaye",
      hint: "Corporate event organizers, brand managers, and B2B partnerships.",
    },
    {
      key: "twitter" as const,
      name: "X (formerly Twitter)",
      icon: TwitterIcon,
      color: "text-gray-900 bg-gray-100 border-gray-300",
      placeholder: "https://x.com/celebritybulaye",
      hint: "Press releases, trending announcements, and live tweet coverage.",
    },
    {
      key: "whatsapp" as const,
      name: "WhatsApp Direct Link",
      icon: () => <span className="text-xs font-black">WA</span>,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      placeholder: "https://wa.me/919820012345",
      hint: "Instant 1-on-1 VIP concierge messaging for organizers.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Official Social Media Profiles</h3>
            <p className="text-xs text-gray-500">
              Configure profile URLs. Empty channels will be automatically hidden from the public header and footer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {socialChannels.map((channel) => {
            const Icon = channel.icon;
            const value = data[channel.key] || "";

            return (
              <div
                key={channel.key}
                className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${channel.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <label className="text-xs font-bold text-gray-800">
                      {channel.name}
                    </label>
                  </div>

                  {value && (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#9B111E] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange({ [channel.key]: e.target.value })}
                  placeholder={channel.placeholder}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#9B111E] outline-none transition-colors"
                />

                <p className="text-[11px] text-gray-400 leading-tight">
                  {channel.hint}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
