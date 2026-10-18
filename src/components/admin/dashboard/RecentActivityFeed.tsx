"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Clock, Users, FolderTree, ArrowRight } from "lucide-react";
import { Celebrity, Category } from "@/types";

interface RecentActivityFeedProps {
  celebrities: Celebrity[];
  categories: Category[];
  isMounted: boolean;
}

interface ActivityItem {
  id: string;
  title: string;
  type: "celebrity" | "category";
  action: string;
  subtitle: string;
  timestamp: string;
  linkHref: string;
}

/**
 * Deterministic UTC date formatter that produces identical output across all server & client locales.
 */
function formatUtcShortDate(isoString?: string): string {
  if (!isoString) return "Recent";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recent";
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
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
  } catch {
    return "Recent";
  }
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  celebrities,
  categories,
  isMounted,
}) => {
  // Aggregate real recent updates derived from actual stored data
  const activities = useMemo(() => {
    const list: ActivityItem[] = [];

    celebrities.forEach((c) => {
      const ts = c.updatedAt || c.createdAt;
      if (ts) {
        list.push({
          id: `act-celeb-${c.id}`,
          title: c.name,
          type: "celebrity",
          action: c.updatedAt !== c.createdAt ? "Profile Modified" : "Profile Added",
          subtitle: `${c.category} · ${c.status || "active"}`,
          timestamp: ts,
          linkHref: `/admin/celebrities?edit=${c.id}`,
        });
      }
    });

    categories.forEach((cat) => {
      if (cat.updatedAt) {
        list.push({
          id: `act-cat-${cat.id}`,
          title: cat.name,
          type: "category",
          action: "Category Updated",
          subtitle: `${cat.subcategories?.length || 0} subcategories · ${cat.status || "active"}`,
          timestamp: cat.updatedAt,
          linkHref: `/admin/categories?edit=${cat.id}`,
        });
      }
    });

    return list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [celebrities, categories]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-0.5 w-3 bg-[#9B111E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B111E]">
              Audit Feed
            </span>
          </div>
          <h2 className="text-base font-bold text-gray-900 font-serif">
            Recently Updated
          </h2>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Timestamp Derived
        </span>
      </div>

      {/* Activity Timeline */}
      <div className="pt-4">
        {activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500">
            No recent activity recorded.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {activities.map((act) => {
              const isCeleb = act.type === "celebrity";
              const dateStr = formatUtcShortDate(act.timestamp);

              return (
                <div key={act.id} className="relative group text-xs">
                  {/* Timeline Node */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-2xs ${
                      isCeleb
                        ? "bg-red-50 text-[#9B111E] border-red-100"
                        : "bg-amber-50 text-[#C5A059] border-amber-100"
                    }`}
                  >
                    {isCeleb ? (
                      <Users className="w-2.5 h-2.5" />
                    ) : (
                      <FolderTree className="w-2.5 h-2.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={act.linkHref}
                          className="font-bold text-gray-900 hover:text-[#9B111E] transition-colors truncate"
                        >
                          {act.title}
                        </Link>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.2 rounded border border-gray-100">
                          {act.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {act.subtitle}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 shrink-0 font-semibold">
                      {dateStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
