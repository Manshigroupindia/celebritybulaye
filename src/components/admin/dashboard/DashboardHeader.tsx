"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Calendar, Sparkles, FolderTree, Users } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    setFormattedDate(`${dayName}, ${monthName} ${d.getDate()}, ${d.getFullYear()}`);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b border-gray-200/90">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#9B111E] text-[11px] font-bold border border-red-100 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>Admin Center</span>
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formattedDate || "Live Portal"}</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif tracking-tight">
          Welcome to Celebrity Bulaye
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
          Manage your celebrity network, categories and booking activity from one place.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200/90 transition-all shadow-xs active:scale-95 disabled:opacity-50"
          title="Refresh statistics and records"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? "animate-spin text-[#9B111E]" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>

        <Link
          href="/admin/categories?action=create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-[#9B111E] hover:text-[#740D16] text-xs font-bold rounded-xl border border-red-200 transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </Link>

        <Link
          href="/admin/celebrities?action=create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-red-950/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Celebrity</span>
        </Link>
      </div>
    </div>
  );
};
