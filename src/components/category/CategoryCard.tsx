import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const displayLabel = category.displayCount || `${category.count || 0}+ Celebrities`;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-gray-900 border border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Category Image with dark cinematic gradient */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-950">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
            <Sparkles className="w-10 h-10 text-gray-700" />
          </div>
        )}

        {/* Luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Subtle top badge with count */}
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white/90 backdrop-blur-xs border border-white/10">
            {displayLabel}
          </span>
        </div>

        {/* Bottom Details */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-wide group-hover:text-[#FFE5A3] transition-colors">
                {category.name}
              </h3>
              <p className="text-[11px] text-gray-300 font-medium">{displayLabel}</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-[#9B111E] transition-colors shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
