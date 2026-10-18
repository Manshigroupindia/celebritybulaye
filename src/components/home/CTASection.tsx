import React from "react";
import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";

export const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-[#740D16] via-[#9B111E] to-[#600610] text-white py-14 sm:py-18 relative overflow-hidden">
      {/* Decorative background star accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-10 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="white">
          <path d="M50 0L61 35L98 38L69 62L79 98L50 75L21 98L31 62L2 38L39 35L50 0Z" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFE5A3] bg-black/20 px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
          Direct Celebrity Management
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-serif mb-4">
          Have a Celebrity in Mind?
        </h2>
        <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed mb-8 font-light">
          Tell us who you want at your event and our team will check direct availability, negotiate rider terms, and coordinate everything smoothly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book-celebrity"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#9B111E] hover:bg-[#FFE5A3] text-sm font-bold rounded-lg shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <span>Book a Celebrity</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-black/30 hover:bg-black/50 text-white text-sm font-semibold rounded-lg border border-white/30 backdrop-blur-xs transition-all"
          >
            <PhoneCall className="w-4 h-4 text-[#FFE5A3]" />
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
