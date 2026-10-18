"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CelebrityGrid } from "@/components/celebrity/CelebrityGrid";
import { useCategories } from "@/hooks/useCategories";
import { useCelebrities } from "@/hooks/useCelebrities";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface CategoryListingViewProps {
  categorySlug: string;
  subcategorySlug?: string;
}

export const CategoryListingView: React.FC<CategoryListingViewProps> = ({
  categorySlug,
  subcategorySlug,
}) => {
  const { categories, getCategoryBySlug, isMounted } = useCategories();
  const { activeCelebrities } = useCelebrities();
  const category = getCategoryBySlug(categorySlug, { includeInactive: true });

  // If mounted and category does not exist or is inactive in public view
  if (isMounted && (!category || category.status === "inactive")) {
    return (
      <div className="bg-[#FAF9F6] min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#9B111E] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-serif mb-2">
            Category Not Available
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
            This category is currently inactive or does not exist in our catalog.
          </p>
          <Link
            href="/book-celebrity"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Categories</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentCat = category || categories.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase());

  if (!currentCat) {
    return (
      <div className="bg-[#FAF9F6] min-h-[50vh] flex items-center justify-center">
        <div className="text-xs text-gray-400">Loading catalog...</div>
      </div>
    );
  }

  const activeSubcategories = (currentCat.subcategories || []).filter(
    (s) => (s.status ?? "active") === "active"
  );

  const activeSubcategory = subcategorySlug
    ? activeSubcategories.find((s) => s.slug.toLowerCase() === subcategorySlug.toLowerCase())
    : null;

  if (subcategorySlug && isMounted && !activeSubcategory) {
    return (
      <div className="bg-[#FAF9F6] min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#9B111E] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-serif mb-2">
            Subcategory Not Found
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
            The requested specialization under {currentCat.name} is not available.
          </p>
          <Link
            href={`/category/${currentCat.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {currentCat.name}</span>
          </Link>
        </div>
      </div>
    );
  }

  const celebrities = activeCelebrities.filter((c) => {
    const matchesCat =
      c.categorySlug?.toLowerCase() === categorySlug.toLowerCase() ||
      c.category?.toLowerCase() === currentCat.name.toLowerCase();

    if (!matchesCat) return false;

    if (subcategorySlug) {
      return (
        (c.subcategorySlug || "").toLowerCase() === subcategorySlug.toLowerCase() ||
        (c.subcategory || "").toLowerCase() === activeSubcategory?.name.toLowerCase()
      );
    }

    return true;
  });

  const breadcrumbs = [
    { label: "Categories", href: "/book-celebrity" },
    { label: currentCat.name, href: subcategorySlug ? `/category/${currentCat.slug}` : undefined },
    ...(activeSubcategory ? [{ label: activeSubcategory.name }] : []),
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbs} />

          <div className="mt-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-0.5 w-4 bg-[#9B111E]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
                {currentCat.name} Catalog
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-serif">
              {activeSubcategory ? activeSubcategory.name : currentCat.name}
            </h1>
            <p className="mt-2 text-xs sm:text-base text-gray-600 font-light leading-relaxed">
              {activeSubcategory?.description || currentCat.description}
            </p>

            {/* Active Subcategory Filter Pills */}
            {activeSubcategories.length > 0 && (
              <div className="mt-6 flex items-center flex-wrap gap-2">
                <Link
                  href={`/category/${currentCat.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    !subcategorySlug
                      ? "bg-[#9B111E] text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All {currentCat.name}s
                </Link>
                {activeSubcategories.map((sub) => {
                  const isActive = subcategorySlug === sub.slug;
                  return (
                    <Link
                      key={sub.slug}
                      href={`/category/${currentCat.slug}/${sub.slug}`}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#9B111E] text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs sm:text-sm font-semibold text-gray-800">
            Showing <span className="text-[#9B111E] font-bold">{celebrities.length}</span> verified{" "}
            {activeSubcategory ? activeSubcategory.name : currentCat.name}s
          </span>
          <Link
            href="/book-celebrity"
            className="text-xs font-bold text-[#9B111E] hover:underline"
          >
            Browse All Categories →
          </Link>
        </div>

        <CelebrityGrid
          celebrities={celebrities}
          emptyTitle={`No ${activeSubcategory ? activeSubcategory.name : currentCat.name}s Available`}
          emptyDescription={`We are currently onboarding additional verified ${currentCat.name}s. Send a custom inquiry and our talent manager will source them.`}
        />
      </div>
    </div>
  );
};
