import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, Award, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { trustStats } from "@/data/siteSettings";

export const metadata: Metadata = {
  title: "About Us — India's Premier Celebrity Liaison Agency | Celebrity Bulaye",
  description:
    "Learn about Celebrity Bulaye, our mission to democratize verified celebrity booking with absolute transparency, legal assurances, and white-glove event production.",
};

const corePillars = [
  {
    title: "100% Direct Verification",
    desc: "We work directly with talent management houses and artists, eliminating unauthorized brokers and inflated middleman markups.",
    icon: ShieldCheck,
  },
  {
    title: "White-Glove Production Concierge",
    desc: "From technical riders (sound, lights, monitors) to green room hospitality, VIP security, and flight logistics.",
    icon: HeartHandshake,
  },
  {
    title: "Ironclad Contracts & Safety",
    desc: "Legally binding performance agreements protecting event hosts with guaranteed replacement clauses and refund assurances.",
    icon: Award,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-black text-white pt-12 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80"
            alt="Red Carpet Celebrity Event"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "About Us" }]}
            className="text-gray-300 mb-6 [&_a]:text-gray-300 [&_a:hover]:text-white [&_span]:text-white"
          />

          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFE5A3] bg-white/10 px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
              Who We Are
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif mb-4 leading-tight">
              Connecting You With The Stars
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
              Celebrity Bulaye was founded with a singular conviction: booking high-caliber celebrities, artists, and live performers in India should be as transparent, professional, and seamless as booking luxury hospitality.
            </p>
          </div>
        </div>
      </section>

      {/* Main Narrative & Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-12 shadow-xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-4 bg-[#9B111E]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
                  Our Story & Mission
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
                Redefining India&apos;s Celebrity Entertainment Ecosystem
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                For decades, the Indian celebrity booking landscape has been opaque—fraught with multiple intermediary agents, unverified representation, last-minute cancellations, and arbitrary pricing.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                Celebrity Bulaye bridges this divide. We combine modern technology with trusted industry relationships to provide event organizers, wedding families, corporations, and brand directors direct, verified access to 500+ leading Indian actors, playback singers, stand-up comics, influencers, and sports champions.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#9B111E]" />
                  <span>Direct Talent Agency Liaisons</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#9B111E]" />
                  <span>Fixed Commercial Transparency</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#9B111E]" />
                  <span>Comprehensive Legal Protection</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#9B111E]" />
                  <span>Full Technical Rider Management</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80"
                  alt="Celebrity Bulaye Executive Event"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E] block mb-1">
              Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
              Why People Choose Celebrity Bulaye
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-2xl border border-gray-200/80 p-7 shadow-xs hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 font-serif">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="bg-gradient-to-r from-[#740D16] to-[#9B111E] rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            {trustStats.map((stat, idx) => (
              <div key={stat.label} className={idx > 0 ? "pt-4 lg:pt-0" : ""}>
                <div className="text-3xl sm:text-5xl font-extrabold font-serif text-[#FFE5A3] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold tracking-wide">
                  {stat.label}
                </div>
                <div className="text-[11px] text-white/70 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-sm">
          <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto mb-3" />
          <h3 className="text-2xl font-extrabold text-gray-900 font-serif mb-2">
            Ready to Plan Your Next Headline Event?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mb-6">
            Speak with an executive celebrity coordinator today or browse our full talent directory.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/book-celebrity"
              className="px-6 py-3 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
            >
              <span>Explore Celebrities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
