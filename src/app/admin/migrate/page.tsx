"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  ArrowRight,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Loader2,
  FolderTree,
  Users,
  GalleryHorizontalEnd,
  Settings,
  Sparkles,
  ExternalLink,
  Info,
  Mail,
} from "lucide-react";
import {
  runFirestoreMigration,
  downloadBackupFile,
  auditImageUrls,
  generateFullDatabaseBackup,
  MigrationReport,
} from "@/services/migrationService";
import { getStoredCategories } from "@/services/categoryService";
import { getStoredCelebrities } from "@/services/celebrityService";
import { getBanners } from "@/services/bannerService";
import { getStoredInquiriesSync } from "@/services/bookingService";

export default function AdminMigrationPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [report, setReport] = useState<MigrationReport | null>(null);

  // Stats
  const [categoryCount, setCategoryCount] = useState(0);
  const [subcategoryCount, setSubcategoryCount] = useState(0);
  const [celebrityCount, setCelebrityCount] = useState(0);
  const [bannerCount, setBannerCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [imageAudit, setImageAudit] = useState<{
    validHostedImages: number;
    warningBlobOrDataImages: number;
    missingImages: number;
  }>({ validHostedImages: 0, warningBlobOrDataImages: 0, missingImages: 0 });

  useEffect(() => {
    // Migration is completed and hidden from normal admin navigation.
    // Redirect ordinary admin visits to the main dashboard.
    router.replace("/admin");
  }, [router]);

  useEffect(() => {
    setIsMounted(true);
    const cats = getStoredCategories();
    setCategoryCount(cats.length);
    setSubcategoryCount(cats.reduce((s, c) => s + (c.subcategories?.length || 0), 0));
    setCelebrityCount(getStoredCelebrities().length);
    setBannerCount(getBanners().length);
    const inqs = getStoredInquiriesSync();
    setInquiryCount(inqs.length > 0 ? inqs.length : 2);
    setImageAudit(auditImageUrls());
  }, []);

  const handleDryRun = async () => {
    setIsRunning(true);
    setProgressPercent(10);
    setProgressText("Running dry-run simulation...");
    try {
      const res = await runFirestoreMigration({
        dryRun: true,
        onProgress: (msg, pct) => {
          setProgressText(msg);
          setProgressPercent(pct);
        },
      });
      setReport(res);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExecuteMigration = async () => {
    if (
      !window.confirm(
        "Are you ready to import all categories, celebrities, banners and settings into Firebase Firestore? Existing records will be safely merged."
      )
    ) {
      return;
    }

    setIsRunning(true);
    setProgressPercent(5);
    setProgressText("Connecting to Firebase Firestore...");
    try {
      const res = await runFirestoreMigration({
        dryRun: false,
        onProgress: (msg, pct) => {
          setProgressText(msg);
          setProgressPercent(pct);
        },
      });
      setReport(res);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9B111E]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-6 bg-[#9B111E] rounded-full" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9B111E]">
              Data Operations & Cloud Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
            Firestore Database Migration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Safely import existing website data into Firebase Cloud Firestore with zero data loss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Idempotent Safe Merge</span>
          </span>
          <button
            type="button"
            onClick={downloadBackupFile}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold shadow-xs hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Download JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Categories</span>
            <FolderTree className="w-4 h-4 text-[#9B111E]" />
          </div>
          <div className="text-2xl font-black text-gray-900">{categoryCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">{subcategoryCount} subcategories attached</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Celebrities</span>
            <Users className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-black text-gray-900">{celebrityCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Full bios, riders & media</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Hero Banners</span>
            <GalleryHorizontalEnd className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{bannerCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Carousels & CTA links</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Site Settings</span>
            <Settings className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">1 Doc</div>
          <p className="text-[11px] text-gray-500 mt-1">SEO, branding, contacts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Leads & Inquiries</span>
            <Mail className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{inquiryCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Client booking records</p>
        </div>
      </div>

      {/* Image Audit Notice */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Media & Image URL Integrity Audit
            </h3>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
              Found <strong>{imageAudit.validHostedImages}</strong> hosted CDN image URLs (Unsplash, HTTPS).
              {imageAudit.warningBlobOrDataImages > 0 && (
                <span className="text-amber-950 font-semibold block mt-1">
                  ⚠️ Note: {imageAudit.warningBlobOrDataImages} item(s) use temporary browser blob/local URLs which should be replaced with permanent CDN links.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-amber-900 block">Cloudinary Ready</span>
          <span className="text-[10px] text-amber-700">All image fields preserved</span>
        </div>
      </div>

      {/* Migration Action Box */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 font-serif">
              Migration Execution Center
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Run a dry-run preview to inspect documents, or execute the live import to Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDryRun}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunning && report?.dryRun ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span>Run Dry-Run Preview</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteMigration}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B111E] to-[#740D16] hover:from-[#740D16] hover:to-[#550910] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunning && !report?.dryRun ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Play className="w-3.5 h-3.5 text-[#FFE5A3] fill-current" />
              )}
              <span>Execute Migration to Firestore</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9B111E]" />
                <span>{progressText}</span>
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9B111E] to-[#C5A059] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Report Summary */}
        {report && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                report.success
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-red-50/80 border-red-200 text-red-900"
              }`}
            >
              {report.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {report.dryRun
                    ? "Dry-Run Simulation Complete"
                    : report.success
                    ? "Migration Completed Successfully"
                    : "Migration Completed With Issues"}
                </h4>
                <p className="text-xs mt-1 leading-relaxed">
                  {report.dryRun
                    ? "Previewed records to be uploaded. Firestore was not modified."
                    : report.success
                    ? "All categories, celebrities, hero banners, and site settings have been imported into Cloud Firestore."
                    : "Some documents could not be saved to Firestore. Check the log below."}
                </p>
              </div>
            </div>

            {/* Verification Stats */}
            {report.firestoreVerification && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block">Firestore Categories</span>
                  <strong className="text-gray-900 text-sm">
                    {report.firestoreVerification.categories} docs verified
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Firestore Celebrities</span>
                  <strong className="text-gray-900 text-sm">
                    {report.firestoreVerification.celebrities} docs verified
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Firestore Banners</span>
                  <strong className="text-gray-900 text-sm">
                    {report.firestoreVerification.banners} docs verified
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Firestore Inquiries</span>
                  <strong className="text-gray-900 text-sm">
                    {report.firestoreVerification.inquiries} docs verified
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 block">Site Settings Doc</span>
                  <strong className="text-emerald-700 text-sm">
                    {report.firestoreVerification.settingsExists ? "Verified (main)" : "Missing"}
                  </strong>
                </div>
              </div>
            )}

            {/* Execution Logs */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 block">Execution Log</span>
              <div className="bg-[#0B0F19] text-gray-300 p-4 rounded-2xl font-mono text-xs max-h-64 overflow-y-auto space-y-1">
                {report.logs.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes("✓")
                        ? "text-emerald-400"
                        : line.includes("✗") || line.includes("ERROR")
                        ? "text-red-400"
                        : line.includes("🎉")
                        ? "text-[#FFE5A3] font-bold"
                        : "text-gray-400"
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Configuration Helper */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 font-serif flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>Need Help with Firebase Rules or Initial Admin?</span>
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          If you encounter a <code>permission-denied</code> error during migration, make sure you have:
        </p>
        <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1.5 pl-1">
          <li>Copied and published <code>firestore.rules</code> in Firebase Console → Firestore Database → Rules.</li>
          <li>Signed in with an authorized administrator account created in Firebase Console → Authentication → Users.</li>
        </ol>
      </div>
    </div>
  );
}
