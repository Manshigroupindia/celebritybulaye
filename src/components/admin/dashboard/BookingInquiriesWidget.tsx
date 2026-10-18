"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Mail,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  getStoredInquiriesSync,
  fetchInquiriesFromFirestore,
  subscribeInquiriesFromFirestore,
  StoredBookingInquiry,
} from "@/services/bookingService";

interface BookingInquiriesWidgetProps {
  isMounted: boolean;
}

export const BookingInquiriesWidget: React.FC<BookingInquiriesWidgetProps> = ({
  isMounted,
}) => {
  const [inquiries, setInquiries] = useState<StoredBookingInquiry[]>([]);

  useEffect(() => {
    if (isMounted) {
      setInquiries(getStoredInquiriesSync());

      // Attempt live Firestore sync if user is an authorized admin
      const unsubscribe = subscribeInquiriesFromFirestore((list) => {
        if (list) {
          setInquiries(list);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isMounted]);

  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(
    (i) => !i.status || i.status === "new"
  ).length;
  const pendingInquiries = inquiries.filter(
    (i) => i.status === "pending"
  ).length;

  const recentInquiries = [...inquiries].reverse().slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs mb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-0.5 w-3 bg-[#9B111E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B111E]">
              Bookings & Leads
            </span>
          </div>
          <h2 className="text-base font-bold text-gray-900 font-serif">
            Booking Inquiries
          </h2>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[10px] font-bold text-emerald-800">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Firestore Ready</span>
        </span>
      </div>

      {/* Inquiry Content */}
      <div className="pt-4">
        {totalInquiries === 0 ? (
          <div className="py-6 px-4 rounded-xl bg-gray-50/70 border border-gray-200/60 text-center">
            <div className="w-10 h-10 rounded-full bg-white text-gray-400 flex items-center justify-center mx-auto mb-2 border border-gray-200 shadow-2xs">
              <CalendarCheck className="w-5 h-5 text-gray-500" />
            </div>
            <h4 className="text-xs font-bold text-gray-800">
              No Inquiries Recorded Yet
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              When clients submit booking forms on celebrity profile pages, their requests will appear here with talent details and event dates.
            </p>
            <div className="mt-3">
              <Link
                href="/book-celebrity"
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9B111E] hover:underline"
              >
                <span>Test Booking Flow</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Counters */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-gray-50 border border-gray-200/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900 font-serif">
                  {totalInquiries}
                </span>
              </div>
              <div className="border-x border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  New
                </span>
                <span className="text-lg font-bold text-emerald-800 font-serif">
                  {newInquiries}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Pending
                </span>
                <span className="text-lg font-bold text-amber-800 font-serif">
                  {pendingInquiries}
                </span>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Recent Submissions
              </div>
              {recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/60 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">
                      {inq.fullName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {inq.eventType}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 flex items-center justify-between">
                    <span>
                      For:{" "}
                      <strong className="text-gray-800">
                        {inq.celebrityName || "General Inquiry"}
                      </strong>
                    </span>
                    {inq.budgetRange && (
                      <span className="text-[#9B111E] font-semibold">
                        {inq.budgetRange}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
