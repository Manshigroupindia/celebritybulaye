"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, ShieldAlert, LogOut, ExternalLink } from "lucide-react";
import { AuthProvider, useAdminAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopHeader } from "@/components/admin/AdminTopHeader";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Allow unrestricted access to the login page itself
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, user, isLoginPage, router]);

  // If on /admin/login, render login page directly without admin wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 1. Loading screen while verifying Firebase Auth & Firestore admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9B111E] to-[#740D16] border border-[#C5A059]/40 flex items-center justify-center text-white shadow-xl shadow-red-950/60 mb-4 animate-pulse">
          <Sparkles className="w-7 h-7 text-[#FFE5A3]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
          <span>Verifying Administrator Access...</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Checking Firebase credentials and permissions</p>
      </div>
    );
  }

  // 2. Unauthenticated: Redirecting to login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-[#9B111E]" />
          <span>Redirecting to secure admin sign in...</span>
        </div>
      </div>
    );
  }

  // 3. Authenticated: Render complete admin CMS layout
  const breadcrumbs =
    pathname === "/admin"
      ? [{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]
      : pathname.startsWith("/admin/celebrities")
      ? [{ label: "Admin", href: "/admin" }, { label: "Celebrities" }]
      : pathname.startsWith("/admin/categories")
      ? [{ label: "Admin", href: "/admin" }, { label: "Categories" }]
      : pathname.startsWith("/admin/banners")
      ? [{ label: "Admin", href: "/admin" }, { label: "Hero Banners" }]
      : pathname.startsWith("/admin/settings")
      ? [{ label: "Admin", href: "/admin" }, { label: "Site Settings" }]
      : [{ label: "Admin", href: "/admin" }, { label: "Dashboard" }];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <AdminSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          breadcrumbs={breadcrumbs}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
