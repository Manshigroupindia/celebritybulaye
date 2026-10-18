"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ChevronRight, Sparkles, MapPin } from "lucide-react";
import { useCelebrities } from "@/hooks/useCelebrities";
import { Celebrity } from "@/types";

export const GlobalSearchDropdown: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Celebrity[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { activeCelebrities } = useCelebrities();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matched = activeCelebrities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.subcategory.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q))
    );
    setResults(matched.slice(0, 5));
  }, [query, activeCelebrities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      router.push(`/book-celebrity?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-[240px] lg:max-w-[280px]" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search celebrities..."
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9B111E] focus:border-[#9B111E] text-gray-800 placeholder-gray-400 transition-all"
        />
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 min-w-[290px] sm:min-w-[320px]">
          <div className="p-2 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span>Search Results ({results.length})</span>
            <span className="text-[10px] text-gray-400">Press Enter to view all</span>
          </div>

          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {results.map((celeb) => (
                <Link
                  key={celeb.id}
                  href={`/celebrity/${celeb.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-red-50/50 transition-colors group"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
                    <Image
                      src={celeb.profileImage}
                      alt={celeb.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-semibold text-gray-900 truncate group-hover:text-[#9B111E]">
                        {celeb.name}
                      </h4>
                      {celeb.verified && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 rounded-full px-1 py-0.2">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate">
                      <span className="text-[#9B111E] font-medium">{celeb.subcategory || celeb.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-gray-400" />
                        {celeb.location}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#9B111E] transition-colors" />
                </Link>
              ))}

              <Link
                href={`/book-celebrity?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="block text-center py-2 text-xs font-semibold text-[#9B111E] hover:bg-gray-50 transition-colors bg-gray-50/70"
              >
                View all results for &ldquo;{query}&rdquo; →
              </Link>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Sparkles className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-800">No celebrities found</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Try searching with another name, category, or specialty.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
