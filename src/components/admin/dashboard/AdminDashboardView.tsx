"use client";

import React, { useState, useCallback } from "react";
import { useCelebrities } from "@/hooks/useCelebrities";
import { useCategories } from "@/hooks/useCategories";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { DashboardMetricsCards } from "@/components/admin/dashboard/DashboardMetricsCards";
import { CelebrityCategoryBreakdown } from "@/components/admin/dashboard/CelebrityCategoryBreakdown";
import { RecentlyAddedCelebrities } from "@/components/admin/dashboard/RecentlyAddedCelebrities";
import { CategoryManagementOverview } from "@/components/admin/dashboard/CategoryManagementOverview";
import { BookingInquiriesWidget } from "@/components/admin/dashboard/BookingInquiriesWidget";
import { DashboardQuickActions } from "@/components/admin/dashboard/DashboardQuickActions";
import { RecentActivityFeed } from "@/components/admin/dashboard/RecentActivityFeed";

export const AdminDashboardView: React.FC = () => {
  const {
    celebrities,
    isMounted: isCelebritiesMounted,
    refresh: refreshCelebrities,
  } = useCelebrities();

  const {
    categories,
    isMounted: isCategoriesMounted,
    refresh: refreshCategories,
  } = useCategories();

  const isMounted = isCelebritiesMounted && isCategoriesMounted;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshCelebrities();
    refreshCategories();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [refreshCelebrities, refreshCategories]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Dashboard Top Header */}
      <DashboardHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 4 Summary Statistics Cards */}
      <DashboardMetricsCards
        celebrities={celebrities}
        categories={categories}
        isMounted={isMounted}
      />

      {/* Main Grid: Left Column (Breakdown, Recents, Categories) & Right Column (Shortcuts, Inquiries, Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Breakdown of Celebrities by Category */}
          <CelebrityCategoryBreakdown
            celebrities={celebrities}
            categories={categories}
            isMounted={isMounted}
          />

          {/* 5 Most Recently Added Celebrities */}
          <RecentlyAddedCelebrities
            celebrities={celebrities}
            isMounted={isMounted}
          />

          {/* Category Management Overview List */}
          <CategoryManagementOverview
            categories={categories}
            celebrities={celebrities}
            isMounted={isMounted}
          />
        </div>

        {/* Right / Side Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel */}
          <DashboardQuickActions />

          {/* Booking Inquiries Widget */}
          <BookingInquiriesWidget isMounted={isMounted} />

          {/* Activity / Recent Audit Feed */}
          <RecentActivityFeed
            celebrities={celebrities}
            categories={categories}
            isMounted={isMounted}
          />
        </div>
      </div>
    </div>
  );
};
