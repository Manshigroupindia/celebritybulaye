import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { SectionHeading } from "@/components/common/SectionHeading";

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Client Experiences"
          title="Trusted by Planners, Brands & Hosts"
          subtitle="Real feedback from corporate organizers, luxury wedding hosts, and festival directors."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div>
                {/* Rating stars & Quote icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#C5A059]">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-red-200 shrink-0" />
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-4">
                  &ldquo;{test.comment}&rdquo;
                </p>

                {/* Celebrity booked tag */}
                <div className="inline-block px-2.5 py-1 bg-white border border-gray-200/80 rounded-md text-[11px] text-[#9B111E] font-medium mb-4">
                  Booked: {test.celebrityBooked}
                </div>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200/60">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                  <Image
                    src={test.avatar}
                    alt={test.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-serif">
                    {test.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {test.role ? `${test.role}, ` : ""}{test.company}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {test.event} • {test.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
