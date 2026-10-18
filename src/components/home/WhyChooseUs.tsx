import React from "react";
import { BadgeCheck, Headphones, FileCheck, Layers, Sparkles, Building2 } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

const features = [
  {
    title: "Verified Celebrity Profiles",
    desc: "Direct contracts and authentic talent liaisons with zero deceptive middle-agents or marked-up fees.",
    icon: BadgeCheck,
  },
  {
    title: "Professional Booking Assistance",
    desc: "Dedicated senior artist managers coordinating sound riders, green rooms, flight logistics, and stay.",
    icon: Headphones,
  },
  {
    title: "Transparent Inquiry Process",
    desc: "Clear booking terms, straightforward availability confirmations, and official performance contracts.",
    icon: FileCheck,
  },
  {
    title: "Wide Range of Categories",
    desc: "From Bollywood A-listers and classical dance exponents to viral creators and sports legends.",
    icon: Layers,
  },
  {
    title: "Personalized Event Support",
    desc: "Tailored celebrity recommendations aligned with your exact audience demographic, venue, and vision.",
    icon: Sparkles,
  },
  {
    title: "Trusted Industry Network",
    desc: "10+ years of deep entertainment industry trust spanning leading production houses, talent guilds, and labels.",
    icon: Building2,
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Unrivaled Assurance"
          title="Why Book With Celebrity Bulaye?"
          subtitle="We eliminate booking uncertainties with guaranteed artist confirmation, transparent contracts, and full production concierge."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-xl hover:border-red-100 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center mb-4 group-hover:bg-[#9B111E] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 font-serif group-hover:text-[#9B111E] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] font-semibold text-[#C5A059]">
                  <span>Guaranteed Professionalism</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
