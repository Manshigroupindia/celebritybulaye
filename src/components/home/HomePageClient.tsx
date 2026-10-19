"use client";

import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { TrustStats } from "@/components/home/TrustStats";
import { ExploreCategories } from "@/components/home/ExploreCategories";
import { FeaturedCelebrities } from "@/components/home/FeaturedCelebrities";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { EventTypesSection } from "@/components/home/EventTypesSection";
import { TrendingCelebrities } from "@/components/home/TrendingCelebrities";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function HomePageClient() {
  const { settings, isMounted } = useSiteSettings();
  const { sections } = settings.homepage;
  const isMaintenance = settings.general.websiteStatus === "maintenance";

  useEffect(() => {
    if (isMounted && settings.seo.defaultTitle) {
      document.title = settings.seo.defaultTitle;
    }
  }, [isMounted, settings.seo.defaultTitle]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Maintenance Mode Banner (Non-locking notification) */}
      {isMaintenance && (
        <div className="bg-amber-400 text-stone-950 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b border-amber-500 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-stone-900 shrink-0" />
          <span>
            <strong>Maintenance Mode:</strong> The site is currently undergoing scheduled maintenance. Booking submissions may be temporarily paused.
          </span>
        </div>
      )}

      {/* 1. Hero */}
      <Hero />

      {/* 2. Trust / Quick Stats */}
      <TrustStats />

      {/* 3. Popular Categories */}
      {sections.popularCategories && <ExploreCategories />}

      {/* 4. Featured Celebrities */}
      {sections.featuredCelebrities && <FeaturedCelebrities />}

      {/* 5. How It Works */}
      {sections.howItWorks && <HowItWorks />}

      {/* 6. Why Celebrity Bulaye */}
      {sections.whyChooseUs && <WhyChooseUs />}

      {/* 7. Event Types */}
      {sections.eventTypes && <EventTypesSection />}

      {/* 8. Trending Celebrities */}
      {sections.trendingCelebrities && <TrendingCelebrities />}

      {/* 9. Testimonials */}
      {sections.testimonials && <TestimonialsSection />}

      {/* 10. Call To Action */}
      {sections.ctaSection && <CTASection />}
    </div>
  );
}
