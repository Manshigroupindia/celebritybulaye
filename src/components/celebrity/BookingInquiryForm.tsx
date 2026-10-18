"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Calendar, MapPin, User, Phone, Mail, FileText, Send, Sparkles } from "lucide-react";
import { BookingInquiryFormData } from "@/types";
import { submitBookingInquiry, BookingSubmissionResponse } from "@/services/bookingService";
import { eventTypes } from "@/data/eventTypes";

interface BookingInquiryFormProps {
  celebrityName: string;
  celebrityId?: string;
}

export const BookingInquiryForm: React.FC<BookingInquiryFormProps> = ({
  celebrityName,
  celebrityId,
}) => {
  const [formData, setFormData] = useState<BookingInquiryFormData>({
    celebrityId,
    celebrityName,
    fullName: "",
    phone: "",
    email: "",
    eventType: "",
    eventDate: "",
    eventLocation: "",
    audienceCount: "100 - 500 guests",
    budgetRange: "₹5L - ₹15L",
    message: "",
    agreedToTerms: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<BookingSubmissionResponse | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = "Please enter a valid phone number (at least 10 digits).";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!formData.eventType) {
      errs.eventType = "Please select an event type.";
    }

    if (!formData.eventDate) {
      errs.eventDate = "Please choose an event date.";
    }

    if (!formData.eventLocation.trim()) {
      errs.eventLocation = "Event city/venue is required.";
    }

    if (!formData.message.trim()) {
      errs.message = "Please share a few details about your event and requirements.";
    }

    if (!formData.agreedToTerms) {
      errs.agreedToTerms = "You must agree to be contacted regarding this inquiry.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await submitBookingInquiry(formData);
      setSubmissionResult(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setFormData({
      celebrityId,
      celebrityName,
      fullName: "",
      phone: "",
      email: "",
      eventType: "",
      eventDate: "",
      eventLocation: "",
      audienceCount: "100 - 500 guests",
      budgetRange: "₹5L - ₹15L",
      message: "",
      agreedToTerms: true,
    });
    setErrors({});
  };

  return (
    <div id="booking-form" className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden scroll-mt-24">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-[#740D16] to-[#9B111E] p-6 sm:p-8 text-white relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#FFE5A3]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#FFE5A3]">
            Verified Direct Inquiry
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-serif">
          Send Booking Inquiry
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-white/90">
          Tell us about your event and our senior talent coordinator will respond with confirmed availability and quote.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {/* SUCCESS STATE */}
        {submissionResult ? (
          <div className="text-center py-8 px-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 font-serif mb-2">
              Thank You for Your Inquiry!
            </h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
              {submissionResult.message}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto mb-6 text-left border border-gray-200/80 text-xs space-y-2">
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-medium">Inquiry Reference:</span>
                <span className="font-bold text-[#9B111E]">{submissionResult.inquiryId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-medium">Celebrity:</span>
                <span className="font-semibold text-gray-800">{formData.celebrityName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500 font-medium">Event Type:</span>
                <span className="font-semibold text-gray-800">{formData.eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Date & City:</span>
                <span className="font-semibold text-gray-800">
                  {formData.eventDate} ({formData.eventLocation})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Readonly Celebrity Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Requested Celebrity
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="celebrityName"
                  value={formData.celebrityName}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-bold text-gray-800 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#9B111E] uppercase tracking-wider bg-red-100 px-2 py-0.5 rounded">
                  Selected
                </span>
              </div>
            </div>

            {/* Row 1: Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Vikramaditya Roy"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                      errors.fullName
                        ? "border-red-500 bg-red-50/30"
                        : "border-gray-200 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E]"
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                      errors.phone
                        ? "border-red-500 bg-red-50/30"
                        : "border-gray-200 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E]"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Row 2: Email & Event Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                      errors.email
                        ? "border-red-500 bg-red-50/30"
                        : "border-gray-200 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-lg outline-none transition-colors bg-white ${
                    errors.eventType
                      ? "border-red-500 bg-red-50/30"
                      : "border-gray-200 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E]"
                  }`}
                >
                  <option value="">Select Event Type</option>
                  {eventTypes.map((et) => (
                    <option key={et.id} value={et.name}>
                      {et.name}
                    </option>
                  ))}
                </select>
                {errors.eventType && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.eventType}</p>
                )}
              </div>
            </div>

            {/* Row 3: Event Date & Event Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Date <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                      errors.eventDate
                        ? "border-red-500 bg-red-50/30"
                        : "border-gray-200 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E]"
                    }`}
                  />
                </div>
                {errors.eventDate && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.eventDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Location / City <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleChange}
                    placeholder="e.g. Grand Hyatt, Mumbai"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                      errors.eventLocation
                        ? "border-red-500 bg-red-50/30"
                        : "border-gray-200 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E]"
                    }`}
                  />
                </div>
                {errors.eventLocation && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.eventLocation}</p>
                )}
              </div>
            </div>

            {/* Row 4: Audience Count & Budget Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Expected Audience / Guest Count
                </label>
                <select
                  name="audienceCount"
                  value={formData.audienceCount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg outline-none focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] bg-white"
                >
                  <option value="Under 100 guests">Under 100 guests (Intimate / VIP)</option>
                  <option value="100 - 500 guests">100 - 500 guests (Mid Scale)</option>
                  <option value="500 - 2,000 guests">500 - 2,000 guests (Large Gala)</option>
                  <option value="2,000+ attendees">2,000+ attendees (Concert / Stadium)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estimated Artist Budget Range
                </label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg outline-none focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] bg-white"
                >
                  <option value="₹2L - ₹5L">₹2 Lakh - ₹5 Lakh</option>
                  <option value="₹5L - ₹15L">₹5 Lakh - ₹15 Lakh</option>
                  <option value="₹15L - ₹30L">₹15 Lakh - ₹30 Lakh</option>
                  <option value="₹30L - ₹50L">₹30 Lakh - ₹50 Lakh</option>
                  <option value="₹50L+">₹50 Lakh+ (Mega Bollywood Star)</option>
                </select>
              </div>
            </div>

            {/* Message / Details */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Event Details & Specific Requirements <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details such as performance duration, stage setup, role (singing, keynote, ribbon cutting, chief guest), and any specific song/act preferences..."
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                    errors.message
                      ? "border-red-500 bg-red-50/30"
                      : "border-gray-200 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E]"
                  }`}
                />
              </div>
              {errors.message && (
                <p className="mt-1 text-[11px] text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Terms Agreement Checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-[#9B111E] focus:ring-[#9B111E]"
                />
                <span className="text-xs text-gray-600 leading-snug">
                  I agree to be contacted by Celebrity Bulaye regarding this booking inquiry.
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="mt-1 text-[11px] text-red-600">{errors.agreedToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#9B111E] hover:bg-[#740D16] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-950/20 hover:shadow-red-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Availability & Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
