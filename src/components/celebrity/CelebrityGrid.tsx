import React from "react";
import { Celebrity } from "@/types";
import { CelebrityCard } from "@/components/celebrity/CelebrityCard";
import { EmptyState } from "@/components/common/EmptyState";

interface CelebrityGridProps {
  celebrities: Celebrity[];
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export const CelebrityGrid: React.FC<CelebrityGridProps> = ({
  celebrities,
  emptyTitle,
  emptyDescription,
  onResetFilters,
}) => {
  if (!celebrities || celebrities.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {celebrities.map((celebrity, index) => (
        <CelebrityCard
          key={celebrity.id}
          celebrity={celebrity}
          priority={index < 4}
        />
      ))}
    </div>
  );
};
