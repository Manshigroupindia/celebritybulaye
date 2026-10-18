import React from "react";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export const metadata: Metadata = {
  title: "Terms & Conditions — Celebrity Bulaye",
  description: "Terms and conditions of celebrity booking and talent representation at Celebrity Bulaye.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200/80 pt-8 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Terms & Conditions" }]} />
          <h1 className="text-3xl font-extrabold text-gray-900 font-serif mt-4">
            Terms & Conditions
          </h1>
          <p className="text-xs text-gray-500 mt-1">Last Updated: October 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing Celebrity Bulaye or submitting a booking inquiry, you agree to comply with and be bound by these Terms and Conditions. These terms apply to all clients, booking agents, event planners, and talent applicants.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">2. Inquiry & Confirmation Process</h2>
            <p>
              Submitting an inquiry through the platform does not constitute an immediate contractual booking. A booking is confirmed only upon signing the definitive Artist Performance Agreement and receipt of the requisite booking advance deposit.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">3. Technical & Hospitality Riders</h2>
            <p>
              The event organizer is responsible for providing all technical specifications (stage, sound PA system, monitoring, lighting) and hospitality requirements (air travel, accommodation, local transfers, security) as mandated in the artist&apos;s signed rider annexure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">4. Event Filming & Intellectual Property</h2>
            <p>
              Live performance appearances do not grant rights for commercial broadcast, streaming, or product merchandising unless explicitly contracted in writing with Celebrity Bulaye and the talent&apos;s management.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">5. Force Majeure & Replacement</h2>
            <p>
              Neither party shall be held liable for failure of performance caused by acts of God, extreme natural calamity, civil disruption, national mourning, or acute medical incapacity. In such events, Celebrity Bulaye will make every reasonable effort to provide an equivalent replacement artist or process refunds as per our cancellation policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
