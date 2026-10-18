"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ChevronRight, ExternalLink, ShieldCheck, User, LogOut } from "lucide-react";
import { useAdminAuth } from "@/context/AuthContext";

interface AdminTopHeaderProps {
  onToggleSidebar?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export const AdminTopHeader: React.FC<AdminTopHeaderProps> = ({
  onToggleSidebar,
  breadcrumbs = [{ label: "Admin", href: "/admin/categories" }, { label: "Categories" }],
}) => {
  const router = useRouter();
  const { user, adminProfile, signOut } = useAdminAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  const displayName = adminProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Administrator";
  const userEmail = user?.email || "admin@celebritybulaye.com";

  return (
    <header className="bg-white border-b border-gray-200/90 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle admin sidebar"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <nav aria-label="Admin Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                {isLast || !crumb.href ? (
                  <span className="font-bold text-gray-900">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-[#9B111E] transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Storage Status, Live Site Link, Admin Profile, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Firestore Backend Connected Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-[11px] font-semibold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Firestore Backend Active</span>
        </div>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#9B111E] bg-red-50 hover:bg-red-100 rounded-lg border border-red-200/60 transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-900 text-[#FFE5A3] flex items-center justify-center font-bold text-xs shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-gray-800 leading-tight truncate max-w-[140px]">
                {displayName}
              </span>
              <span className="block text-[10px] text-gray-500 truncate max-w-[140px]">
                {userEmail}
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            title="Sign Out of Admin CMS"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
