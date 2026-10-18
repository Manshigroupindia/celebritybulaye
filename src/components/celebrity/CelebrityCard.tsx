import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Celebrity } from "@/types";

interface CelebrityCardProps {
  celebrity: Celebrity;
  priority?: boolean;
}

export const CelebrityCard: React.FC<CelebrityCardProps> = ({ celebrity, priority = false }) => {
  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Portrait Image Container */}
      <Link
        href={`/celebrity/${celebrity.slug}`}
        className="relative aspect-4/5 w-full overflow-hidden bg-gray-100 block"
      >
        <Image
          src={celebrity.profileImage}
          alt={celebrity.name}
          fill
          priority={priority}
          className="object-cover object-top group-hover:scale-106 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category Pill Tag overlaid on image bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-black/60 text-[#FFE5A3] backdrop-blur-xs border border-white/10 uppercase tracking-wider">
            {celebrity.category}
          </span>
        </div>

        {/* Hover quick-view arrow top-right */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="w-7 h-7 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md">
            <ArrowUpRight className="w-4 h-4 text-[#9B111E]" />
          </span>
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Name & Verified checkmark */}
          <div className="flex items-center gap-1.5 mb-1">
            <Link
              href={`/celebrity/${celebrity.slug}`}
              className="text-base font-bold text-gray-900 hover:text-[#9B111E] transition-colors truncate font-serif"
            >
              {celebrity.name}
            </Link>
            {celebrity.verified && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 shrink-0" />
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{celebrity.location}</span>
          </div>

          {/* Specialty / Tags */}
          <p className="text-xs text-gray-600 line-clamp-1 font-medium">
            {celebrity.specialties.slice(0, 2).join(" • ") || celebrity.subcategory}
          </p>
        </div>

        {/* Dual Actions: View Profile & Book Now */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <Link
            href={`/celebrity/${celebrity.slug}`}
            className="text-center py-2 px-3 border border-gray-200 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/celebrity/${celebrity.slug}#booking-form`}
            className="text-center py-2 px-3 bg-[#9B111E] hover:bg-[#740D16] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};
