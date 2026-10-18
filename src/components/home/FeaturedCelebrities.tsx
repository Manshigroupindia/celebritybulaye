"use client";

import React, { useMemo } from "react";
import { useCelebrities } from "@/hooks/useCelebrities";
import { CelebrityCard } from "@/components/celebrity/CelebrityCard";
import { SectionHeading } from "@/components/common/SectionHeading";

export const FeaturedCelebrities: React.FC = () => {
  const { activeCelebrities } = useCelebrities();

  const featured = useMemo(() => {
    return activeCelebrities.filter((c) => c.featured);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
          {featured.map((celebrity, idx) => (
            <CelebrityCard
              key={celebrity.id}
              celebrity={celebrity}
              priority={idx < 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
