import React from "react";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Celebrity Bulaye",
  description: "Official cancellation terms, date shifts and refund guidelines at Celebrity Bulaye.",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200/80 pt-8 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Refund / Cancellation Policy" }]} />
          <h1 className="text-3xl font-extrabold text-gray-900 font-serif mt-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-gray-500 mt-1">Last Updated: October 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">1. Booking Advances</h2>
            <p>
              Due to artists blocking private dates exclusively for your engagement and turning down competing offers, booking advance retainers are generally non-refundable once confirmed and counter-signed.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">2. Client Cancellation Timelines</h2>
            <p>
              In the event that an organizer must cancel an engagement:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>More than 45 days prior:</strong> 50% of the advance amount may be eligible for credit toward a rescheduled date within 6 months, subject to artist mutual availability.</li>
              <li><strong>Within 30 days of show:</strong> The booking advance is 100% forfeited to compensate the artist for reserved dates.</li>
              <li><strong>Within 7 days of show:</strong> The full contracted fee is payable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">3. Artist Unforeseen Incapacity & Full Refund</h2>
            <p>
              If a booked celebrity cannot attend due to documented medical emergency or filming force majeure, the client will immediately be presented with:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>An immediate 100% full refund of all amounts paid to Celebrity Bulaye.</li>
              <li>Or an option to substitute an equivalent or higher-category artist with expedited coordination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">4. Date Rescheduling</h2>
            <p>
              Date modifications requested at least 30 days prior to the engagement date will be accommodated without penalty whenever artist calendar permits.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
