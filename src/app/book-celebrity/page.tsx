import React, { Suspense } from "react";
import { Metadata } from "next";
import { BookCelebrityClient } from "./BookCelebrityClient";

export const metadata: Metadata = {
  title: "Book a Celebrity — Explore All Artists & Personalities | Celebrity Bulaye",
  description:
    "Browse verified Indian celebrities, actors, singers, comedians, influencers and sports stars available for weddings, corporate events and private bookings.",
};

export default function BookCelebrityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-[#9B111E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">Loading celebrities...</p>
          </div>
        </div>
      }
    >
      <BookCelebrityClient />
    </Suspense>
  );
}
