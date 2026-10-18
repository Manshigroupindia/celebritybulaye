"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Edit2, ExternalLink, ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { Celebrity } from "@/types";

interface RecentlyAddedCelebritiesProps {
  celebrities: Celebrity[];
  isMounted: boolean;
}

/**
 * Deterministic UTC date formatter that produces identical output across all server & client locales.
 */
function formatUtcDate(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return "—";
  }
}

export const RecentlyAddedCelebrities: React.FC<RecentlyAddedCelebritiesProps> = ({
  celebrities,
  isMounted,
}) => {
  // 5 most recently created celebrities
  const recentCelebrities = useMemo(() => {
    return [...celebrities]
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [celebrities]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-0.5 w-3 bg-[#9B111E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B111E]">
              Recent Talents
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 font-serif">
            Recently Added Celebrities
          </h2>
          <p className="text-xs text-gray-500">
            Latest profiles added to the Celebrity Bulaye talent roster.
          </p>
        </div>

        <Link
          href="/admin/celebrities"
          className="text-xs font-semibold text-[#9B111E] hover:text-[#740D16] inline-flex items-center gap-1 shrink-0"
        >
          <span>View All Celebrities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List / Table */}
      <div className="pt-4 overflow-x-auto">
        {recentCelebrities.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              No celebrities added yet.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click &quot;+ Add Celebrity&quot; to register your first celebrity profile.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3 pl-1">Celebrity</th>
                <th className="pb-3 hidden sm:table-cell">Category</th>
                <th className="pb-3 hidden md:table-cell">Location</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 hidden lg:table-cell">Added On</th>
                <th className="pb-3 text-right pr-1">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCelebrities.map((celeb) => {
                const img = celeb.mainImage || celeb.profileImage || "";
                const status = celeb.status || "active";
                const dateStr = formatUtcDate(celeb.createdAt);

                return (
                  <tr
                    key={celeb.id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    {/* Name & Photo */}
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0 shadow-2xs">
                          {img ? (
                            <Image
                              src={img}
                              alt={celeb.name}
                              fill
                              sizes="40px"
                              className="object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Users className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/celebrities?edit=${celeb.id}`}
                            className="font-bold text-gray-900 hover:text-[#9B111E] truncate block transition-colors text-xs sm:text-sm"
                          >
                            {celeb.name}
                          </Link>
                          <span className="text-[11px] text-gray-500 sm:hidden block truncate">
                            {celeb.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 hidden sm:table-cell text-gray-700">
                      <div>
                        <span className="font-semibold">{celeb.category}</span>
                        {celeb.subcategory && (
                          <span className="text-[10px] text-gray-400 block">
                            {celeb.subcategory}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 hidden md:table-cell text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {celeb.livingLocation || celeb.location || "Mumbai"}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3">
                      {status === "active" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      )}
                      {status === "inactive" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                      {status === "draft" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 hidden lg:table-cell text-gray-500 text-[11px] font-mono">
                      {dateStr}
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right pr-1">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          href={`/admin/celebrities?edit=${celeb.id}`}
                          className="p-1.5 rounded-lg bg-gray-50 hover:bg-[#9B111E] hover:text-white text-gray-600 transition-colors"
                          title="Edit profile in wizard"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/celebrity/${celeb.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-200 text-gray-600 transition-colors"
                          title="View live public profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
