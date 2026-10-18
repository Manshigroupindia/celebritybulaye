import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { eventTypes } from "@/data/eventTypes";
import { SectionHeading } from "@/components/common/SectionHeading";

export const EventTypesSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-[#0B0F19] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-0.5 w-4 bg-[#C5A059]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFE5A3]">
                Event Specializations
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              Celebrity Appearances for Every Occasion
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-2xl font-light">
              From intimate VIP dinners to stadium concerts and national brand launches, discover the right talent format.
            </p>
          </div>
          <Link
            href="/book-celebrity"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#FFE5A3] hover:text-white transition-colors shrink-0"
          >
            <span>Explore All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {eventTypes.slice(0, 10).map((event) => (
            <Link
              key={event.id}
              href={`/book-celebrity?eventType=${encodeURIComponent(event.name)}`}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-950">
                <Image
                  src={event.image}
                  alt={event.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500 opacity-80"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                  <h3 className="text-sm font-bold tracking-wide group-hover:text-[#FFE5A3] transition-colors font-serif mb-1">
                    {event.name}
                  </h3>
                  <p className="text-[11px] text-gray-300 line-clamp-2 mb-2 leading-relaxed font-light">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-[#C5A059] font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Popular: {event.popularCategories[0]}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
