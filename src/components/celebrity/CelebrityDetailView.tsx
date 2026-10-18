"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Languages,
  Clock,
  Star,
  Layers,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { BookingInquiryForm } from "@/components/celebrity/BookingInquiryForm";
import { CelebrityGalleryLightbox } from "@/components/celebrity/CelebrityGalleryLightbox";
import { useCelebrities } from "@/hooks/useCelebrities";
import { Celebrity } from "@/types";

interface CelebrityDetailViewProps {
  slug: string;
  initialCelebrity?: Celebrity | null;
}

export const CelebrityDetailView: React.FC<CelebrityDetailViewProps> = ({
  slug,
  initialCelebrity,
}) => {
  const { celebrities, isMounted } = useCelebrities();

  // Pre-mount: use SSR initialCelebrity prop for deterministic initial render.
  // Post-mount: use live reactive celebrities store to reflect any client updates.
  const celebrity = isMounted
    ? celebrities.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null
    : initialCelebrity || null;

  // Inactive or draft check: hide from public
  const isHidden =
    celebrity && (celebrity.status === "inactive" || celebrity.status === "draft");

  if (isMounted) {
    if (!celebrity || isHidden) {
      return (
        <div className="bg-[#FAF9F6] min-h-[70vh] flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#9B111E] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 font-serif mb-2">
              Profile Unavailable
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
              {isHidden
                ? "This celebrity profile is currently inactive or saved as a private draft."
                : "We could not find the requested celebrity profile in our directory."}
            </p>
            <Link
              href="/book-celebrity"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Celebrities</span>
            </Link>
          </div>
        </div>
      );
    }
  } else {
    // Initial SSR and initial client hydration pass:
    // If not found in server seed data or is hidden, render deterministic loading fallback.
    if (!celebrity || isHidden) {
      return (
        <div className="bg-[#FAF9F6] min-h-[50vh] flex items-center justify-center">
          <div className="text-xs text-gray-400">Loading celebrity profile...</div>
        </div>
      );
    }
  }

  const breadcrumbs = [
    { label: "Book Celebrity", href: "/book-celebrity" },
    { label: celebrity.category, href: `/category/${celebrity.categorySlug}` },
    { label: celebrity.name },
  ];

  const mainImg = celebrity.mainImage || celebrity.profileImage || "";
  const bio = celebrity.biography || celebrity.description || "";
  const events = celebrity.availableFor || celebrity.eventTypes || [];
  const loc = celebrity.livingLocation || celebrity.location || "Mumbai, India";

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Main Profile Grid: Left Image/Gallery, Right Details */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden p-6 sm:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT: Portrait Image & Badges */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 shadow-md">
                {mainImg ? (
                  <Image
                    src={mainImg}
                    alt={celebrity.name}
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badges on Image */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 text-[#FFE5A3] backdrop-blur-md text-xs font-bold border border-white/20 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{celebrity.category}</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  {celebrity.subcategory && (
                    <span className="font-semibold bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs">
                      {celebrity.subcategory}
                    </span>
                  )}
                  {celebrity.priceRange && (
                    <span className="font-bold text-[#FFE5A3] bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs">
                      {celebrity.priceRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Liaison Guarantee Box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">100% Verified Direct Talent</span>
                  <span className="text-[11px] text-emerald-700">
                    Official management liaison with legal contract protection.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Profile Details & Booking CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Category & Status */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {celebrity.subcategory && (
                    <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
                      {celebrity.subcategory}
                    </span>
                  )}
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{loc}</span>
                  </div>
                  {celebrity.rating && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-xs text-[#C5A059] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#C5A059]" />
                        <span>{celebrity.rating.toFixed(1)}</span>
                        {celebrity.reviewsCount && (
                          <span className="text-gray-400 font-normal">
                            ({celebrity.reviewsCount} events)
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Name */}
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight font-serif">
                    {celebrity.name}
                  </h1>
                  {celebrity.verified && (
                    <span title="Verified Artist" className="mt-1">
                      <CheckCircle2 className="w-7 h-7 text-blue-600 fill-blue-50" />
                    </span>
                  )}
                </div>

                {/* Short intro */}
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light mb-6">
                  {celebrity.shortDescription}
                </p>

                {/* Quick Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                      Experience
                    </span>
                    <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#9B111E]" />
                      {celebrity.experience || (celebrity.experienceYears ? `${celebrity.experienceYears}+ Years` : "5+ Years")}
                    </span>
                  </div>

                  {celebrity.languages && celebrity.languages.length > 0 && (
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Languages
                      </span>
                      <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5 truncate">
                        <Languages className="w-3.5 h-3.5 text-[#9B111E] shrink-0" />
                        <span className="truncate">{celebrity.languages.join(", ")}</span>
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                      Service Area
                    </span>
                    <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#9B111E] shrink-0" />
                      <span className="truncate">
                        {celebrity.serviceAreas?.join(", ") || "Pan-India & Global"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Available For Event Types */}
                {events.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#9B111E]" />
                      <span>Available For Booking:</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {events.map((et) => (
                        <span
                          key={et}
                          className="px-3 py-1 bg-red-50 text-[#9B111E] rounded-lg text-xs font-semibold border border-red-100"
                        >
                          {et}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties Tags */}
                {celebrity.specialties && celebrity.specialties.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#C5A059]" />
                      <span>Specialties & Format Highlights:</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {celebrity.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <a
                  href="#booking-form"
                  className="flex-1 py-3.5 px-6 bg-[#9B111E] hover:bg-[#740D16] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/20 hover:shadow-red-900/30 transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span>Send Booking Inquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#about-section"
                  className="py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition-colors text-center"
                >
                  Read Full Bio
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections Grid: Biography & Photo Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Biography & Performance Highlights */}
          <div
            id="about-section"
            className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-0.5 w-4 bg-[#9B111E]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
                  Biography & Profile
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 font-serif">
                About {celebrity.name}
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-4 whitespace-pre-line font-light">
              {bio}
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 font-serif">
                Booking Protocols & Coordination
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Standard technical requirements (soundcheck, lighting, stage specifications) and hospitality coordination (travel logistics, private green room arrangements) are managed directly by Celebrity Bulaye talent managers upon confirmation.
              </p>
            </div>
          </div>

          {/* Photo Gallery & Lightbox */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-0.5 w-4 bg-[#C5A059]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                  Visual Portfolio
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 font-serif">
                Photo Gallery
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Click any photo to open full-resolution high definition lightbox preview.
              </p>
            </div>

            <CelebrityGalleryLightbox
              images={celebrity.gallery && celebrity.gallery.length > 0 ? celebrity.gallery : [mainImg]}
              celebrityName={celebrity.name}
            />
          </div>
        </div>

        {/* BOOKING INQUIRY FORM */}
        <div id="booking-form" className="max-w-4xl mx-auto mb-16">
          <BookingInquiryForm
            celebrityName={celebrity.name}
            celebrityId={celebrity.id}
          />
        </div>
      </div>

      {/* Sticky Mobile CTA Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-3 sm:hidden z-40 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-gray-900 truncate max-w-[140px]">
            {celebrity.name}
          </div>
          <div className="text-[10px] text-[#9B111E] font-semibold">
            {celebrity.category}
          </div>
        </div>
        <a
          href="#booking-form"
          className="px-5 py-2.5 bg-[#9B111E] text-white rounded-lg text-xs font-bold shadow-md"
        >
          Book This Celebrity
        </a>
      </div>
    </div>
  );
};
