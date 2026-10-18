import React from "react";
import { SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Celebrities Found",
  description = "We couldn't find any artists matching your search or active filters. Try refining your keywords or clearing filters.",
  actionText = "Clear All Filters",
  onAction,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-8">
      <div className="w-14 h-14 rounded-full bg-red-50 text-[#9B111E] flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
