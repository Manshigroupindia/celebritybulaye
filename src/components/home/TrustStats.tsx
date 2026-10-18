"use client";

import React from "react";
import { Users, CalendarCheck, MapPin, Headphones } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const TrustStats: React.FC = () => {
  const { settings } = useSiteSettings();
  const { stat1, stat2, stat3, stat4 } = settings.homepage.trustStats;

  const stats = [
    {
      icon: Users,
      value: stat1?.value || "500+",
      label: stat1?.label || "Celebrities",
      sub: stat1?.sub || "Direct Artist Network",
    },
    {
      icon: CalendarCheck,
      value: stat2?.value || "1000+",
      label: stat2?.label || "Successful Bookings",
      sub: stat2?.sub || "Pan-India & Global",
    },
    {
      icon: MapPin,
      value: stat3?.value || "50+",
      label: stat3?.label || "Cities",
      sub: stat3?.sub || "Event Destinations",
    },
    {
      icon: Headphones,
      value: stat4?.value || "24/7",
      label: stat4?.label || "Booking Assistance",
      sub: stat4?.sub || "Dedicated Talent Managers",
    },
  ];

  return (
    <section className="bg-white border-b border-gray-100 py-6 sm:py-8 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={`${stat.label}-${idx}`}
                className={`flex items-center gap-4 ${
                  idx > 0 ? "pt-4 lg:pt-0 lg:pl-6" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0 border border-red-100/60">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-serif">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-800">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-gray-400 hidden sm:block">
                    {stat.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
