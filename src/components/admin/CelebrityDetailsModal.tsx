"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  MapPin,
  Briefcase,
  Languages,
  Sparkles,
  Lock,
  ExternalLink,
  Edit2,
  CheckCircle2,
  Calendar,
  Globe,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { Celebrity } from "@/types";

interface CelebrityDetailsModalProps {
  celebrity: Celebrity | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (celebrity: Celebrity) => void;
}

export const CelebrityDetailsModal: React.FC<CelebrityDetailsModalProps> = ({
  celebrity,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !celebrity) return null;

  const isPublished = (celebrity.status ?? "active") === "active";
  const events = celebrity.availableFor || celebrity.eventTypes || [];
  const mainImg = celebrity.mainImage || celebrity.profileImage || "";
  const bio = celebrity.biography || celebrity.description || "";
  const loc = celebrity.livingLocation || celebrity.location || "Not specified";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B0F19] to-[#1C1917] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#FFE5A3] bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60 uppercase tracking-widest">
              Celebrity Record
            </span>
            <span className="text-xs text-gray-400 font-mono">#{celebrity.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start gap-5 pb-6 border-b border-gray-100">
            <div className="relative w-28 h-36 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm">
              {mainImg ? (
                <Image
                  src={mainImg}
                  alt={celebrity.name}
                  fill
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
              {celebrity.verified && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-xs" title="Verified Profile">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif">
                  {celebrity.name}
                </h3>
                {celebrity.featured && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#C5A059]" />
                    Featured
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    celebrity.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : celebrity.status === "draft"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {celebrity.status || "active"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[#9B111E] text-xs font-bold border border-red-100">
                  {celebrity.category}
                </span>
                {celebrity.subcategory && (
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                    {celebrity.subcategory}
                  </span>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {loc}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed pt-1">
                {celebrity.shortDescription}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-400 block mb-0.5 font-medium">Experience</span>
              <span className="font-bold text-gray-800">
                {celebrity.experience || (celebrity.experienceYears ? `${celebrity.experienceYears} Years` : "5+ Years")}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-400 block mb-0.5 font-medium">Languages</span>
              <span className="font-bold text-gray-800 truncate block">
                {celebrity.languages?.join(", ") || "Hindi, English"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-400 block mb-0.5 font-medium">Service Areas</span>
              <span className="font-bold text-gray-800 truncate block">
                {celebrity.serviceAreas?.join(", ") || "Pan India"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <span className="text-gray-400 block mb-0.5 font-medium">Profile Slug</span>
              <span className="font-mono text-[11px] text-[#9B111E] truncate block">
                /{celebrity.slug}
              </span>
            </div>
          </div>

          {/* Available For Bookings */}
          {events.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#9B111E]" />
                Available For Event Formats
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {events.map((evt) => (
                  <span
                    key={evt}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-xs font-semibold text-gray-700"
                  >
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specialties */}
          {celebrity.specialties && celebrity.specialties.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#9B111E]" />
                Specialties & Highlights
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {celebrity.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 rounded-lg bg-red-50 text-[#9B111E] text-xs font-semibold border border-red-100"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Public Biography */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Public Biography
            </h4>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-light">
              {bio || "No detailed biography provided."}
            </div>
          </div>

          {/* Private Booking Protocols & Hospitality Rider */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Booking Protocols & Hospitality Rider (Internal Only)
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded">
                Confidential
              </span>
            </div>
            <p className="text-xs text-amber-900/90 whitespace-pre-line leading-relaxed font-light">
              {celebrity.bookingProtocols || "No custom booking rider or protocol specified."}
            </p>
          </div>

          {/* Gallery Preview */}
          {celebrity.gallery && celebrity.gallery.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Gallery Images ({celebrity.gallery.length})
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {celebrity.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <Image src={img} alt={`${celebrity.name} ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {isPublished ? (
              <Link
                href={`/celebrity/${celebrity.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B111E] hover:underline"
              >
                <span>View Live Profile Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="text-xs text-gray-400 italic">
                (Profile is currently hidden from public website)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(celebrity);
              }}
              className="px-4 py-2 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
