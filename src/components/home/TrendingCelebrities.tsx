"use client";

import React, { useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { useCelebrities } from "@/hooks/useCelebrities";
import { SectionHeading } from "@/components/common/SectionHeading";

export const TrendingCelebrities: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeCelebrities } = useCelebrities();

  const trending = useMemo(() => {
    return activeCelebrities.filter((c) => c.trending);
  }, [activeCelebrities]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-[#FAF9F6] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading
            badge="Spotlight Talent"
            title="Trending Celebrities"
            subtitle="Artists capturing maximum inquiries and social media buzz this season."
            className="mb-0!"
          />

          {/* Navigation Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-[#9B111E] hover:border-[#9B111E] flex items-center justify-center transition-colors shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-[#9B111E] hover:border-[#9B111E] flex items-center justify-center transition-colors shadow-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Showcase */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
        >
          {trending.map((celeb) => (
            <div
              key={celeb.id}
              className="w-[260px] sm:w-[280px] shrink-0 snap-start bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <Link
                href={`/celebrity/${celeb.slug}`}
                className="relative aspect-4/5 w-full bg-gray-100 overflow-hidden block"
              >
                <Image
                  src={celeb.profileImage}
                  alt={celeb.name}
                  fill
                  className="object-cover object-top group-hover:scale-106 transition-transform duration-500"
                  sizes="280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-[#FFE5A3] uppercase tracking-wider backdrop-blur-xs">
                    {celeb.category}
                  </span>
                </div>
              </Link>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Link
                      href={`/celebrity/${celeb.slug}`}
                      className="text-sm font-bold text-gray-900 hover:text-[#9B111E] transition-colors truncate font-serif"
                    >
                      {celeb.name}
                    </Link>
                    {celeb.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{celeb.location}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    {celeb.subcategory}
                  </p>
                </div>

                <Link
                  href={`/celebrity/${celeb.slug}`}
                  className="w-full text-center py-2 px-3 bg-red-50 hover:bg-[#9B111E] text-[#9B111E] hover:text-white rounded-lg text-xs font-bold transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
