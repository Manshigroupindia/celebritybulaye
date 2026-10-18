"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface CelebrityGalleryLightboxProps {
  images: string[];
  celebrityName: string;
}

export const CelebrityGalleryLightbox: React.FC<CelebrityGalleryLightboxProps> = ({
  images,
  celebrityName,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null;

  const handleNext = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % images.length);
    }
  }, [activeIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + images.length) % images.length);
    }
  }, [activeIndex, images.length]);

  const handleClose = () => {
    setActiveIndex(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev]);

  if (!images || images.length === 0) return null;

  return (
    <div>
      {/* Gallery Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9B111E]"
          >
            <Image
              src={img}
              alt={`${celebrityName} photo ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-108 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="p-2 rounded-full bg-white/80 text-gray-900 shadow-md">
                <Maximize2 className="w-4 h-4 text-[#9B111E]" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Top Bar with counter & close */}
          <div className="absolute top-4 inset-x-4 max-w-7xl mx-auto flex items-center justify-between z-50 text-white">
            <div className="text-xs sm:text-sm font-semibold tracking-wide">
              {celebrityName} — Image {activeIndex + 1} of {images.length}
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close lightbox"
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Main Large Image */}
          <div className="relative w-full max-w-4xl max-h-[80vh] aspect-4/3 sm:aspect-16/10 flex items-center justify-center">
            <Image
              src={images[activeIndex]}
              alt={`${celebrityName} preview`}
              fill
              priority
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
