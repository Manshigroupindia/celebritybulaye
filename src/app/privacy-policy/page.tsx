import React from "react";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy — Celebrity Bulaye",
  description: "Privacy policy and client data protection commitments at Celebrity Bulaye.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200/80 pt-8 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Privacy Policy" }]} />
          <h1 className="text-3xl font-extrabold text-gray-900 font-serif mt-4">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 mt-1">Last Updated: October 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">1. Overview</h2>
            <p>
              Celebrity Bulaye (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects the privacy and confidentiality of our clients, event planners, and artists. This Privacy Policy details how we collect, handle, and protect personal and event information submitted through our website and booking desk.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">2. Information We Collect</h2>
            <p>
              When you submit an inquiry, request a quotation, or apply as a talent, we collect personal identifying information including your full name, phone number, email address, corporate designation, event venue, dates, budget specifications, and guest count.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">3. Use of Information</h2>
            <p>
              Your contact and event specifications are used exclusively to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Verify celebrity schedule availability and negotiate performance terms.</li>
              <li>Provide formal booking agreements, riders, and invoices.</li>
              <li>Coordinate on-ground logistics, security protocols, and green room management.</li>
              <li>Comply with statutory tax and contractual requirements under Indian law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">4. Confidentiality & Non-Disclosure</h2>
            <p>
              We treat all VIP event requirements, guest lists, and private celebration details with strict non-disclosure. We never sell, lease, or distribute your private information to third-party marketing companies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">5. Data Security</h2>
            <p>
              We employ industry-standard encryption, SSL protocols, and restricted role-based internal access to ensure that all booking and artist data remains safe from unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 font-serif mb-2">6. Contact Information</h2>
            <p>
              For questions concerning this Privacy Policy or data inquiries, please email our compliance desk at{" "}
              <a href="mailto:privacy@celebritybulaye.com" className="text-[#9B111E] font-medium underline">
                privacy@celebritybulaye.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
