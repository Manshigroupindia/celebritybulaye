"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { CategoryNavbar } from "@/components/layout/CategoryNavbar";
import { MobileMenu } from "@/components/layout/MobileMenu";

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="w-full relative z-40 bg-white">
      <TopNavbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      <CategoryNavbar />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};
