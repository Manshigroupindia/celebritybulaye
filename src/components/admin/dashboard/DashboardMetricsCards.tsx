"use client";

import React from "react";
import Link from "next/link";
import { Users, FolderTree, Layers, Star, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Celebrity, Category } from "@/types";

interface DashboardMetricsCardsProps {
  celebrities: Celebrity[];
  categories: Category[];
  isMounted: boolean;
}

export const DashboardMetricsCards: React.FC<DashboardMetricsCardsProps> = ({
  celebrities,
  categories,
  isMounted,
}) => {
  // Calculations strictly from actual data
  const totalCelebrities = celebrities.length;
  const activeCelebrities = celebrities.filter(
    (c) => (c.status ?? "active") === "active"
  ).length;
  const inactiveCelebrities = totalCelebrities - activeCelebrities;

  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (c) => (c.status ?? "active") === "active"
  ).length;

  const totalSubcategories = categories.reduce(
    (sum, cat) => sum + (cat.subcategories?.length || 0),
    0
  );

  const featuredCelebrities = celebrities.filter(
    (c) => c.featured && (c.status ?? "active") === "active"
  ).length;

  const cards = [
    {
      title: "Total Celebrities",
      value: isMounted ? totalCelebrities : totalCelebrities,
      supportingText: isMounted
        ? `${activeCelebrities} active · ${inactiveCelebrities} inactive/draft`
        : "Loading records...",
      icon: Users,
      iconBg: "bg-red-50 text-[#9B111E] border-red-100",
      linkHref: "/admin/celebrities",
      linkText: "View directory",
      badgeText: "Talent Roster",
    },
    {
      title: "Total Categories",
      value: isMounted ? totalCategories : totalCategories,
      supportingText: isMounted
        ? `${activeCategories} active of ${totalCategories} total`
        : "Loading categories...",
      icon: FolderTree,
      iconBg: "bg-amber-50 text-[#C5A059] border-amber-100",
      linkHref: "/admin/categories",
      linkText: "Manage catalog",
      badgeText: "Taxonomy",
    },
    {
      title: "Subcategories",
      value: isMounted ? totalSubcategories : totalSubcategories,
      supportingText: isMounted
        ? `Across ${totalCategories} primary verticals`
        : "Loading subcategories...",
      icon: Layers,
      iconBg: "bg-blue-50 text-blue-700 border-blue-100",
      linkHref: "/admin/categories",
      linkText: "View subcategories",
      badgeText: "Specialties",
    },
    {
      title: "Featured Talents",
      value: isMounted ? featuredCelebrities : featuredCelebrities,
      supportingText: isMounted
        ? "Spotlighted on homepage & key banners"
        : "Loading spotlights...",
      icon: Star,
      iconBg: "bg-purple-50 text-purple-700 border-purple-100",
      linkHref: "/admin/celebrities?category=all",
      linkText: "Manage featured",
      badgeText: "Homepage",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Title, Badge, Icon */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                    {card.badgeText}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-700">
                    {card.title}
                  </h3>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 ${card.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Metric Value */}
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-serif tracking-tight">
                  {card.value}
                </span>
              </div>

              {/* Supporting information */}
              <p className="text-xs text-gray-500 font-normal leading-relaxed">
                {card.supportingText}
              </p>
            </div>

            {/* Bottom Link */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
              <Link
                href={card.linkHref}
                className="text-[#9B111E] hover:text-[#740D16] inline-flex items-center gap-1 group-hover:underline"
              >
                <span>{card.linkText}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <span className="text-[11px] text-gray-400 font-mono">
                Real-time
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
