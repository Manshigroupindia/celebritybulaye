"use client";

import React from "react";
import { useCategories } from "@/hooks/useCategories";
import { CategoryCard } from "@/components/category/CategoryCard";
import { SectionHeading } from "@/components/common/SectionHeading";

export const ExploreCategories: React.FC = () => {
  const { activeCategories } = useCategories();

  return (
    <section id="categories-section" className="py-14 sm:py-18 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Explore By Category"
          title="Find the Perfect Celebrity for Your Event"
          subtitle="Browse verified talent across cinema, music, digital media, live comedy, and sports."
          actionText="View All Categories"
          actionHref="/book-celebrity"
        />

        {/* Dynamic Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {activeCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};
