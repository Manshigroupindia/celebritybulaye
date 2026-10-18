import React from "react";
import { Compass, UserCheck, FileText, ShieldCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Explore",
    desc: "Browse curated categories and discover verified celebrities tailored to your event.",
    icon: Compass,
  },
  {
    num: "02",
    title: "Select",
    desc: "Choose the celebrity or artist that aligns with your theme, budget, and guest profile.",
    icon: UserCheck,
  },
  {
    num: "03",
    title: "Send Inquiry",
    desc: "Share your event date, city, venue, and requirements through a 60-second form.",
    icon: FileText,
  },
  {
    num: "04",
    title: "Connect & Confirm",
    desc: "Our senior talent manager coordinates artist riders, dates, and contracts seamlessly.",
    icon: ShieldCheck,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-[#FAF9F6] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-0.5 w-4 bg-[#9B111E]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
              Simple Booking Flow
            </span>
            <span className="h-0.5 w-4 bg-[#9B111E]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-serif">
            Book Your Celebrity in 4 Simple Steps
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Transparent, professional, and zero-hassle celebrity coordination from discovery to showtime.
          </p>
        </div>

        {/* 4 Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.num} className="relative flex flex-col items-center text-center group">
                {/* Step Icon Container */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200/90 shadow-sm flex items-center justify-center text-[#9B111E] group-hover:bg-[#9B111E] group-hover:text-white group-hover:border-[#9B111E] transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  {/* Step Number Tag */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C5A059] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {step.num}
                  </span>
                </div>

                {/* Text */}
                <h3 className="text-base font-bold text-gray-900 mb-1.5 font-serif group-hover:text-[#9B111E] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                  {step.desc}
                </p>

                {/* Arrow connector between steps on desktop */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-8 -right-4 translate-x-1/2 text-gray-300">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
