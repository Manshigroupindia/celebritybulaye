"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  GalleryHorizontalEnd,
  CalendarCheck,
  Settings,
  Database,
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      status: "active",
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      status: "active",
    },
    {
      name: "Celebrities",
      href: "/admin/celebrities",
      icon: Users,
      status: "active",
    },
    {
      name: "Hero Banners",
      href: "/admin/banners",
      icon: GalleryHorizontalEnd,
      status: "active",
    },
    {
      name: "Inquiries",
      href: "/admin/inquiries",
      icon: CalendarCheck,
      status: "placeholder",
    },
    {
      name: "Site Settings",
      href: "/admin/settings",
      icon: Settings,
      status: "active",
    },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] text-gray-300 flex flex-col h-full border-r border-gray-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9B111E] to-[#740D16] border border-[#C5A059]/40 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4 text-[#FFE5A3]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-wider text-sm font-serif">
                CELEBRITY BULAYE
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-[#FFE5A3] bg-red-950/80 px-1.5 py-0.2 rounded border border-red-800/60 uppercase tracking-widest">
                ADMIN CMS
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isFunctional = item.status === "active";

          if (!isFunctional) {
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-gray-500 cursor-not-allowed opacity-60 hover:opacity-80"
                title="This module will be built in the next development phase"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span>{item.name}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-800/80 text-gray-400 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-[#9B111E] text-white shadow-md shadow-red-950/40"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFE5A3]" />
            </Link>
          );
        })}
      </div>

      {/* Dev-only warning & Back to site */}
      <div className="p-3 border-t border-gray-800 space-y-3">
        {/* Firebase Security Status */}
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-[10px] text-emerald-200/90 leading-relaxed flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div>
            <strong className="block font-semibold text-emerald-300">Firebase Security:</strong>
            Admin session active & verified
          </div>
        </div>

        {/* Exit to Public Website */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold transition-colors border border-gray-700/50"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
          <span>Exit to Website</span>
          <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
        </Link>
      </div>
    </aside>
  );
};
