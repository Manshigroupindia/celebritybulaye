"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Building,
} from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { submitContactMessage } from "@/services/bookingService";

const faqs = [
  {
    q: "How far in advance should I book a celebrity for an event?",
    a: "We recommend initiating inquiries 4 to 8 weeks in advance for corporate galas and college fests, and 3 to 6 months in advance for peak wedding season (November to February). However, our team frequently accommodates last-minute requests within 48 to 72 hours subject to artist availability.",
  },
  {
    q: "How does Celebrity Bulaye ensure transparent pricing?",
    a: "We work directly with talent management houses and artist representatives. You receive clear quotations outlining the artist performance commercial, technical rider essentials, and hospitality requirements with zero hidden broker markups.",
  },
  {
    q: "What happens if a celebrity has an unforeseen shooting schedule or medical emergency?",
    a: "All bookings are backed by our legally binding performance contract. In the rare event of a medical emergency or force majeure, our contract provides options for a full refund or equivalent A-list replacement artist from our premium network.",
  },
  {
    q: "Who handles flight logistics, local transit, and green room riders?",
    a: "Celebrity Bulaye provides end-to-end concierge support. A dedicated senior talent coordinator liaises with your event planning team to verify venue sound specs, security protocols, airport transfers, and green room provisions.",
  },
  {
    q: "Can I book international artists or sports stars through your platform?",
    a: "Yes. In addition to Bollywood actors and Indian playback singers, we represent international DJs, motivational sports legends, and global keynote speakers for Pan-India and overseas destination events.",
  },
];

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const contact = settings.contact;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Booking Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required.";
    if (!formData.phone.trim()) errs.phone = "Phone number is required.";
    if (!formData.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Invalid email format.";
    }
    if (!formData.message.trim()) errs.message = "Message cannot be empty.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitContactMessage(formData);
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message.";
      setErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Contact Us" }]} />

          <div className="mt-4 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-0.5 w-4 bg-[#9B111E]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
                Get In Touch
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-serif">
              Contact Celebrity Bulaye
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Have questions regarding celebrity fees, date holds, or custom artist curation? Our executive concierge desk is at your service.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Contact Info & Office Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-100 pb-3">
                Corporate Headquarters
              </h2>

              <div className="space-y-4 text-xs text-gray-600">
                {contact.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs">Executive Office</span>
                      <span className="leading-relaxed">
                        {contact.address}
                        {contact.city ? `, ${contact.city}` : ""}
                        {contact.state ? `, ${contact.state}` : ""}
                        {contact.postalCode ? ` - ${contact.postalCode}` : ""}
                        {contact.country ? `, ${contact.country}` : ""}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block text-xs">Delhi NCR Regional Hub</span>
                    <span className="leading-relaxed">Level 7, DLF Cyber City, Tower B, Gurugram, Haryana 122002</span>
                  </div>
                </div>

                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs">VIP Booking Hotline</span>
                      <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="hover:text-[#9B111E] font-medium">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {contact.whatsapp && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black">WA</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs">WhatsApp Desk</span>
                      <a
                        href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-700 font-medium text-emerald-600"
                      >
                        {contact.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                {contact.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs">Direct Talent Desk</span>
                      <a href={`mailto:${contact.email}`} className="hover:text-[#9B111E] font-medium">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {contact.supportEmail && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block text-xs">Customer Support Desk</span>
                      <a href={`mailto:${contact.supportEmail}`} className="hover:text-[#9B111E] font-medium">
                        {contact.supportEmail}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block text-xs">Operating Hours</span>
                    <span>Monday - Saturday: 9:30 AM - 8:30 PM (24/7 on show days)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">
                Mumbai Office Map Location
              </h3>
              <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 flex flex-col items-center justify-center text-center p-6 text-white group">
                <div className="absolute inset-0 bg-radial from-gray-800 via-gray-900 to-black opacity-90" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#9B111E] flex items-center justify-center shadow-lg mb-2 animate-bounce">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-bold font-serif">
                    {contact.city || "Mumbai"}, {contact.state || "Maharashtra"}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5 max-w-xs truncate">
                    {contact.address || "Lotus Grandeur, Veera Desai Road"}
                  </span>
                  {contact.googleMapsUrl && (
                    <a
                      href={contact.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-semibold backdrop-blur-xs transition-colors"
                    >
                      Open in Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl font-extrabold text-gray-900 font-serif mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 font-light">
              Fill in your event specifications and our team will get in touch promptly.
            </p>

            {isSuccess ? (
              <div className="text-center py-12 px-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-serif mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto mb-6">
                  Thank you for reaching out to Celebrity Bulaye. Our coordinator will review your request and get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      name: "",
                      phone: "",
                      email: "",
                      subject: "General Booking Inquiry",
                      message: "",
                    });
                  }}
                  className="px-5 py-2.5 bg-[#9B111E] text-white rounded-lg text-xs font-bold hover:bg-[#740D16] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                        errors.name ? "border-red-500" : "border-gray-200 focus:border-[#9B111E]"
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                        errors.phone ? "border-red-500" : "border-gray-200 focus:border-[#9B111E]"
                      }`}
                    />
                    {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                        errors.email ? "border-red-500" : "border-gray-200 focus:border-[#9B111E]"
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white text-gray-800"
                    >
                      <option value="General Booking Inquiry">General Booking Inquiry</option>
                      <option value="Corporate Event Quotation">Corporate Event Quotation</option>
                      <option value="Destination Wedding Inquiry">Destination Wedding Inquiry</option>
                      <option value="Brand Endorsement / Collaboration">Brand Endorsement / Collaboration</option>
                      <option value="Artist Representation Query">Artist Representation Query</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Your Message / Event Brief <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the celebrity you want, tentative dates, city, and audience size..."
                    className={`w-full p-3.5 text-xs sm:text-sm border rounded-xl outline-none ${
                      errors.message ? "border-red-500" : "border-gray-200 focus:border-[#9B111E]"
                    }`}
                  />
                  {errors.message && <p className="mt-1 text-[11px] text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#9B111E] hover:bg-[#740D16] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto pt-6">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E] block mb-1">
              Helpful Insights
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 font-serif">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-[#9B111E] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-[#9B111E]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs text-gray-600 leading-relaxed font-light border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
