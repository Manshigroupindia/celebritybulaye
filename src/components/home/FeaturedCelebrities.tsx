"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useCelebrities } from "@/hooks/useCelebrities";
import { CelebrityCard } from "@/components/celebrity/CelebrityCard";
import { SectionHeading } from "@/components/common/SectionHeading";

export const FeaturedCelebrities: React.FC = () => {
  const { activeCelebrities, isLoading, error, refresh } = useCelebrities();

  const featured = useMemo(() => {
    const explicitlyFeatured = activeCelebrities.filter((c) => c.featured);
    if (explicitlyFeatured.length > 0) return explicitlyFeatured.slice(0, 6);
    return activeCelebrities.slice(0, 6);
  }, [activeCelebrities]);

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Featured Celebrities"
          title="Popular & In Demand Talents"
          subtitle="Handpicked personalities available for wedding appearances, corporate keynotes, and live concerts."
          actionText="View All Celebrities"
          actionHref="/book-celebrity"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-2xs animate-pulse"
              >
                <div className="aspect-4/5 bg-gray-200/80 w-full" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3.5 bg-gray-200/80 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-200/60 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50/50 rounded-2xl border border-red-100 max-w-md mx-auto p-6">
            <AlertCircle className="w-8 h-8 text-[#9B111E] mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900 mb-1">Unable to Load Celebrities</p>
            <p className="text-xs text-gray-600 mb-4">A temporary connection error occurred while retrieving talent profiles.</p>
            <button
              onClick={() => refresh()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 max-w-lg mx-auto p-6">
            <p className="text-sm font-semibold text-gray-800 mb-1">Celebrity Directory Updating</p>
            <p className="text-xs text-gray-500 mb-4">Profiles are currently being synchronized with our verified database.</p>
            <Link
              href="/book-celebrity"
              className="text-xs font-bold text-[#9B111E] hover:underline"
            >
              Browse All Talents →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
            {featured.map((celebrity, idx) => (
              <CelebrityCard
                key={celebrity.id}
                celebrity={celebrity}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
