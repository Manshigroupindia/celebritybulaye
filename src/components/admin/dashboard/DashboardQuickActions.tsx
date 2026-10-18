"use client";

import React from "react";
import Link from "next/link";
import {
  UserPlus,
  FolderPlus,
  Users,
  FolderTree,
  Globe,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const DashboardQuickActions: React.FC = () => {
  const actions = [
    {
      title: "Add Celebrity",
      description: "Create a new celebrity profile with photo, bio, and pricing.",
      href: "/admin/celebrities?action=create",
      icon: UserPlus,
      color: "bg-red-50 text-[#9B111E] border-red-100",
      isExternal: false,
    },
    {
      title: "Add Category",
      description: "Define a new event vertical with custom subcategories.",
      href: "/admin/categories?action=create",
      icon: FolderPlus,
      color: "bg-amber-50 text-[#C5A059] border-amber-100",
      isExternal: false,
    },
    {
      title: "Manage Celebrities",
      description: "Filter, search, toggle status, and edit existing artists.",
      href: "/admin/celebrities",
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-100",
      isExternal: false,
    },
    {
      title: "Manage Categories",
      description: "Reorder verticals and manage active subcategories.",
      href: "/admin/categories",
      icon: FolderTree,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      isExternal: false,
    },
    {
      title: "View Public Website",
      description: "Open the live homepage to verify public appearance.",
      href: "/",
      icon: Globe,
      color: "bg-purple-50 text-purple-700 border-purple-100",
      isExternal: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs mb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-0.5 w-3 bg-[#9B111E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B111E]">
              Shortcuts
            </span>
          </div>
          <h2 className="text-base font-bold text-gray-900 font-serif">
            Quick Actions
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-2.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              href={act.href}
              target={act.isExternal ? "_blank" : undefined}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/70 transition-all group shadow-2xs"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${act.color} transition-transform group-hover:scale-105`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-[#9B111E] transition-colors">
                    {act.title}
                  </span>
                  {act.isExternal ? (
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#9B111E] shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#9B111E] group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {act.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
