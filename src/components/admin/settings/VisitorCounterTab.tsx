"use client";

import React, { useState } from "react";
import { VisitorCounterSettings } from "@/types/settings";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface VisitorCounterTabProps {
  data: VisitorCounterSettings;
  onChange: (updated: Partial<VisitorCounterSettings>) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

export const VisitorCounterTab: React.FC<VisitorCounterTabProps> = ({
  data,
  onChange,
  onSave,
  isSaving = false,
}) => {
  const [localSavedNotice, setLocalSavedNotice] = useState(false);

  const handleToggle = () => {
    onChange({ enabled: !data.enabled });
  };

  const handleCountChange = (val: string) => {
    const parsed = parseInt(val.replace(/[^0-9]/g, ""), 10);
    const count = isNaN(parsed) ? 0 : parsed;
    onChange({
      startingCount: count,
      currentCount: count,
    });
  };

  const handleInlineSave = async () => {
    if (onSave) {
      await onSave();
      setLocalSavedNotice(true);
      setTimeout(() => setLocalSavedNotice(false), 3500);
    }
  };

  const formattedCount = (data.currentCount ?? data.startingCount ?? 10000).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Tab Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#9B111E] flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Dynamic Visitor Counter</h3>
            <p className="text-xs text-gray-500">
              Configure public website footer visitor counting, starting count & live visits
            </p>
          </div>
        </div>

        {/* Status & Live Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Status Display Card */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Counter Status & Display
            </span>
            <div className="flex items-center gap-2.5 my-1">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  data.enabled ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-bold text-gray-900">
                {data.enabled ? "Active & Counting" : "Disabled (Hidden from Public)"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {data.enabled
                ? "The visitor badge is currently visible in the website footer and actively increments for eligible new visitor sessions."
                : "The counter is hidden on the public website. Existing counts remain safely preserved in Firestore."}
            </p>
          </div>

          {/* Current Live Count Card */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Configured / Current Value
            </span>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-gray-900 font-serif">
                {formattedCount}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Visitors: {formattedCount}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Live value displayed to visitors on the website.
            </p>
          </div>
        </div>

        {/* 1. Enable / Disable Toggle */}
        <div
          onClick={handleToggle}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 mb-5 ${
            data.enabled
              ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/60"
              : "border-gray-200 bg-gray-50/40 hover:bg-gray-100/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                data.enabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {data.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <span>Enable Visitor Counter on Footer</span>
                {data.enabled ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Enabled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                    Disabled
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Toggle to show or hide the live visitor count in the public website footer.
              </p>
            </div>
          </div>

          <div
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
              data.enabled ? "bg-emerald-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                data.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>

        {/* 2. Numeric Input for Starting/Current Count */}
        <div className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
              <span>Starting / Current Visitor Count</span>
              <span className="text-[11px] text-gray-400 font-normal">
                Default: 10,000
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={data.currentCount ?? data.startingCount ?? 10000}
                onChange={(e) => handleCountChange(e.target.value)}
                placeholder="10000"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-[#9B111E] focus:ring-1 focus:ring-[#9B111E] outline-none transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                Visits
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Set an initial or baseline count (e.g. 10000). Once saved and enabled, the counter automatically increments as new eligible visitors browse the website. The initial value will not reset when pages reload.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[11px] text-gray-400 font-medium mr-1">Quick Presets:</span>
            {[5000, 10000, 25000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleCountChange(preset.toString())}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Dedicated Save Button */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {localSavedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Visitor Counter settings saved to Firestore!</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleInlineSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#9B111E] hover:bg-[#740D16] rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Visitor Counter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Technical / Security Guarantees Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Counting Engine & Security Rules</h3>
            <p className="text-xs text-gray-500">
              How Celebrity Bulaye protects counter integrity and prevents inflated counts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/70 space-y-1">
            <span className="font-bold text-gray-900 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Session-Based Genuine Visit Rule
            </span>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Visits are counted once per browser session via session tracking. Navigating between different pages within the same session will not inflate the counter.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/70 space-y-1">
            <span className="font-bold text-gray-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              StrictMode & Hydration Guard
            </span>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              React 19 Strict Mode, fast re-renders, and hydration checks are guarded with synchronous deduplication, ensuring zero accidental duplicate increments.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/70 space-y-1">
            <span className="font-bold text-gray-900 block flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
              Admin Dashboard Excluded
            </span>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              All routes under <code>/admin/*</code> and internal CMS management navigation are automatically bypassed and will never register as public website visits.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/70 space-y-1">
            <span className="font-bold text-gray-900 block flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              Atomic Firestore Updates
            </span>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Increments use Firestore atomic operations. High concurrency visits will not overwrite each other or reset the initial configured baseline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
