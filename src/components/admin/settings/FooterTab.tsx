"use client";

import React from "react";
import { FooterSettings } from "@/types/settings";
import { LayoutTemplate, CheckSquare, Square } from "lucide-react";

interface FooterTabProps {
  data: FooterSettings;
  onChange: (updated: Partial<FooterSettings>) => void;
}

export const FooterTab: React.FC<FooterTabProps> = ({ data, onChange }) => {
  const toggleField = (field: keyof FooterSettings) => {
    onChange({ [field]: !data[field] });
  };

  const toggles: Array<{
    key: "showSocialLinks" | "showContactInfo" | "showCategoryLinks" | "showQuickLinks";
    title: string;
    description: string;
  }> = [
    {
      key: "showSocialLinks",
      title: "Display Social Media Icons",
      description: "Show configured social profile links under the bio column.",
    },
    {
      key: "showContactInfo",
      title: "Display Direct Contact Desk",
      description: "Show hotline phone, email, and Mumbai office address in the footer.",
    },
    {
      key: "showCategoryLinks",
      title: "Display Top Category Links",
      description: "Show quick links to Actor, Singer, Comedian, Sports & Influencer categories.",
    },
    {
      key: "showQuickLinks",
      title: "Display Quick Navigation Links",
      description: "Show navigation links for About Us, Book Celebrity, Join Us, Contact & Privacy Policy.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Footer Text Content */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Footer Text & Identity</h3>
            <p className="text-xs text-gray-500">
              Customize the company description and legal copyright notice
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Footer Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Footer Description / Bio
            </label>
            <textarea
              rows={4}
              value={data.footerDescription}
              onChange={(e) => onChange({ footerDescription: e.target.value })}
              placeholder="Celebrity Bulaye is India's most trusted celebrity booking and talent liaison agency..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
            <p className="text-[11px] text-gray-400">
              Displays beneath the footer logo in the first column of the footer.
            </p>
          </div>

          {/* Copyright Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Footer Copyright Notice
            </label>
            <input
              type="text"
              value={data.copyrightText}
              onChange={(e) => onChange({ copyrightText: e.target.value })}
              placeholder="© 2026 Celebrity Bulaye. All Rights Reserved."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
            />
            <p className="text-[11px] text-gray-400">
              Displayed in the bottom-most legal strip of the footer.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section Toggles */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Footer Column Controls</h3>
            <p className="text-xs text-gray-500">
              Show or hide specific footer blocks without altering navigation routes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {toggles.map((item) => {
            const isChecked = !!data[item.key];

            return (
              <div
                key={item.key}
                onClick={() => toggleField(item.key)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isChecked
                    ? "border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50"
                    : "border-gray-200 bg-gray-50/40 hover:bg-gray-100/60 opacity-70"
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 pl-5.5 leading-tight">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 mt-0.5 ${
                    isChecked ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isChecked ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
