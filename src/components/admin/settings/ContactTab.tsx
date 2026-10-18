"use client";

import React from "react";
import { ContactSettings } from "@/types/settings";
import { Phone, Mail, MapPin, MessageSquare, ExternalLink } from "lucide-react";

interface ContactTabProps {
  data: ContactSettings;
  onChange: (updated: Partial<ContactSettings>) => void;
}

export const ContactTab: React.FC<ContactTabProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Phone & Direct Communication */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Direct Contact Channels</h3>
            <p className="text-xs text-gray-500">Phone numbers and instant messaging desks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Public Contact Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>Public Contact Phone</span>
            </label>
            <input
              type="text"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+91 98200 12345"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">Renders as clickable tel: link in header, footer & contact page.</p>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Number</span>
            </label>
            <input
              type="text"
              value={data.whatsapp}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              placeholder="+91 98200 12345"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">Renders as a direct WhatsApp chat link (https://wa.me/...).</p>
          </div>

          {/* Contact Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>Booking / Inquiries Email</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="bookings@celebritybulaye.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">Primary booking desk mailbox. Renders as mailto: link.</p>
          </div>

          {/* Support Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>Support / Escalations Email</span>
            </label>
            <input
              type="email"
              value={data.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              placeholder="support@celebritybulaye.com"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-400">Customer care and dispute resolution desk.</p>
          </div>
        </div>
      </div>

      {/* Corporate Address & Physical Location */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Headquarters & Office Address</h3>
            <p className="text-xs text-gray-500">Corporate location shown on contact page and footer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Office Address */}
          <div className="space-y-1.5 md:col-span-4">
            <label className="text-xs font-semibold text-gray-800">
              Street / Building Address
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Level 14, Lotus Grandeur, Veera Desai Road, Andheri West"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none transition-colors"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-gray-800">City</label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Mumbai"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* State */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-gray-800">State</label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="Maharashtra"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-gray-800">Postal / PIN Code</label>
            <input
              type="text"
              value={data.postalCode}
              onChange={(e) => onChange({ postalCode: e.target.value })}
              placeholder="400053"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-gray-800">Country</label>
            <input
              type="text"
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="India"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
          </div>

          {/* Google Maps URL */}
          <div className="space-y-1.5 md:col-span-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800">
                Google Maps Embed / Navigation Link
              </label>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#9B111E] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="url"
              value={data.googleMapsUrl}
              onChange={(e) => onChange({ googleMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=Celebrity+Bulaye+Mumbai"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
            <p className="text-[11px] text-gray-400">
              Users can click &quot;Open in Google Maps&quot; on the Contact page to view directions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
