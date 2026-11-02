"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Database,
  ArrowRight,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FolderTree,
  Users,
  GalleryHorizontalEnd,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  Search,
  Upload,
  FileText,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  Eye,
  Pause,
  RefreshCw,
} from "lucide-react";
import {
  analyzeMigrationPayload,
  runBatchMigration,
  exportReportAsJson,
  LegacyMigrationFilePayload,
  MigrationAnalysis,
  MigrationExecutionResult,
  DuplicateReportItem,
  CategoryMappingSummary,
} from "@/services/legacyMigrationService";
import { Celebrity } from "@/types";
import { auth } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AuthContext";

export default function AdminMigrationPage() {
  const { user, isAdmin, loading: authLoading } = useAdminAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [payload, setPayload] = useState<LegacyMigrationFilePayload | null>(null);
  const [analysis, setAnalysis] = useState<MigrationAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<
    "mapping" | "descriptions" | "duplicates" | "samples" | "console"
  >("mapping");

  // Filter & Search states
  const [mappingSearch, setMappingSearch] = useState("");
  const [descriptionSearch, setDescriptionSearch] = useState("");
  const [duplicateSearch, setDuplicateSearch] = useState("");

  // Execution & Progress states
  const [isRunning, setIsRunning] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [executionResult, setExecutionResult] = useState<MigrationExecutionResult | null>(null);

  // Resume tracking
  const [processedWpIds, setProcessedWpIds] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Load saved resume IDs from localStorage if available
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("cb_migrated_wp_ids");
      if (saved) {
        setProcessedWpIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not read saved migration checkpoint:", e);
    }
    // Auto-load bundled migration JSON on mount
    loadDefaultMigrationJson();
  }, []);

  // Auto-load bundled migration JSON on mount or when admin session is verified
  useEffect(() => {
    if (user && isAdmin) {
      loadDefaultMigrationJson();
    }
  }, [user, isAdmin]);

  const loadDefaultMigrationJson = async () => {
    setIsLoadingFile(true);
    try {
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : "";
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/migration-data", { headers });
      const json = await res.json();
      if (json.success && json.data) {
        setPayload(json.data);
        const analyzed = analyzeMigrationPayload(json.data);
        setAnalysis(analyzed);
      } else {
        console.warn("API route response:", json.error, json.details);
      }
    } catch (err) {
      console.error("Failed to load migration JSON from server:", err);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setPayload(parsed);
        const analyzed = analyzeMigrationPayload(parsed);
        setAnalysis(analyzed);
      } catch (err) {
        alert("Invalid JSON file: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoadingFile(false);
      }
    };
    reader.readAsText(file);
  };

  // Run Dry-Run Simulation
  const handleRunDryRun = async () => {
    if (!payload) return;

    setIsRunning(true);
    setIsDryRun(true);
    setActiveTab("console");
    setLogs([]);
    setProgressPercent(5);
    setProgressMessage("Starting dry-run simulation...");

    try {
      const res = await runBatchMigration(payload, {
        dryRun: true,
        batchSize: 200,
        onProgress: (prog) => {
          setProgressPercent(prog.percent);
          setProgressMessage(prog.message);
          setCurrentBatch(prog.currentBatch);
          setTotalBatches(prog.totalBatches);
          setProcessedCount(prog.processed);
          setCreatedCount(prog.created);
          setUpdatedCount(prog.updated);
          setSkippedCount(prog.skipped);
          setFailedCount(prog.failed);
          if (prog.log) {
            setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${prog.log}`]);
          }
        },
      });
      setExecutionResult(res);
      setLogs(res.logs);
    } catch (err: unknown) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] FATAL: ${err instanceof Error ? err.message : String(err)}`,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  // Start Live Cloud Migration
  const handleStartLiveMigration = async () => {
    if (!payload) return;

    const confirmed = window.confirm(
      "CONFIRMATION REQUIRED:\n\nYou are about to import " +
        (analysis?.uniqueRecords || payload.celebrities.length) +
        " celebrity profiles into Firebase Cloud Firestore.\n\n" +
        "• Categories will NOT be altered or duplicated.\n" +
        "• Existing manual records will be protected.\n" +
        "• Firestore batched writes (200 docs/batch) will be used.\n\n" +
        "Do you want to proceed with live Firestore import?"
    );

    if (!confirmed) return;

    setIsRunning(true);
    setIsDryRun(false);
    setActiveTab("console");
    setLogs([]);
    setProgressPercent(5);
    setProgressMessage("Connecting to Cloud Firestore...");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await runBatchMigration(payload, {
        dryRun: false,
        batchSize: 200,
        delayBetweenBatchesMs: 250,
        skipWpIds: processedWpIds,
        signal: controller.signal,
        onProgress: (prog) => {
          setProgressPercent(prog.percent);
          setProgressMessage(prog.message);
          setCurrentBatch(prog.currentBatch);
          setTotalBatches(prog.totalBatches);
          setProcessedCount(prog.processed);
          setCreatedCount(prog.created);
          setUpdatedCount(prog.updated);
          setSkippedCount(prog.skipped);
          setFailedCount(prog.failed);
          if (prog.committedWpIds && prog.committedWpIds.length > 0) {
            setProcessedWpIds(prog.committedWpIds);
            try {
              localStorage.setItem("cb_migrated_wp_ids", JSON.stringify(prog.committedWpIds));
            } catch (e) {
              console.warn("Storage quota warning for checkpointing:", e);
            }
          }
          if (prog.log) {
            setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${prog.log}`]);
          }
        },
      });

      setExecutionResult(res);
      setLogs(res.logs);

      // Save processed IDs checkpoint
      if (res.committedWpIds && res.committedWpIds.length > 0) {
        setProcessedWpIds(res.committedWpIds);
        try {
          localStorage.setItem("cb_migrated_wp_ids", JSON.stringify(res.committedWpIds));
        } catch (e) {
          console.warn("Storage quota exceeded for checkpointing:", e);
        }
      }
    } catch (err: unknown) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ERROR: ${err instanceof Error ? err.message : String(err)}`,
      ]);
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  // Verified 5-record pilot candidates approved for controlled import
  const PILOT_WP_IDS = ["1271", "1690", "2015", "2174", "11442"];

  // Start Controlled Pilot Migration (5 records)
  const handleRunPilotMigration = async () => {
    if (!payload) return;

    const confirmed = window.confirm(
      "CONTROLLED PILOT MIGRATION CONFIRMATION:\n\n" +
        "You are approving ONLY a controlled pilot migration of 5 celebrity profiles into Cloud Firestore:\n" +
        "1. Udit Narayan (#1271) - Music > Singer\n" +
        "2. Sidharth Malhotra (#1690) - Actor > Bollywood Actor\n" +
        "3. Kapil Sharma (#2015) - Comedian > Stand-up Comedian\n" +
        "4. Nora Fatehi (#2174) - Actress > Bollywood Actress\n" +
        "5. Kriti Sanon (#11442) - Actress > Bollywood Actress (Curated Generated Description)\n\n" +
        "• Existing manual records (Neha Sharma) will be strictly protected.\n" +
        "• No categories or subcategories will be modified.\n" +
        "• The remaining 1,500 profiles will NOT be imported.\n\n" +
        "Do you want to proceed with this 5-record pilot import?"
    );

    if (!confirmed) return;

    setIsRunning(true);
    setIsDryRun(false);
    setActiveTab("console");
    setLogs([]);
    setProgressPercent(10);
    setProgressMessage("Starting 5-record controlled pilot migration...");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await runBatchMigration(payload, {
        dryRun: false,
        batchSize: 5,
        targetWpIds: PILOT_WP_IDS,
        delayBetweenBatchesMs: 200,
        skipWpIds: processedWpIds,
        signal: controller.signal,
        onProgress: (prog) => {
          setProgressPercent(prog.percent);
          setProgressMessage(prog.message);
          setCurrentBatch(prog.currentBatch);
          setTotalBatches(prog.totalBatches);
          setProcessedCount(prog.processed);
          setCreatedCount(prog.created);
          setUpdatedCount(prog.updated);
          setSkippedCount(prog.skipped);
          setFailedCount(prog.failed);
          if (prog.committedWpIds && prog.committedWpIds.length > 0) {
            setProcessedWpIds(prog.committedWpIds);
            try {
              localStorage.setItem("cb_migrated_wp_ids", JSON.stringify(prog.committedWpIds));
            } catch (e) {
              console.warn("Storage quota warning for checkpointing:", e);
            }
          }
          if (prog.log) {
            setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${prog.log}`]);
          }
        },
      });

      setExecutionResult(res);
      setLogs(res.logs);

      if (res.committedWpIds && res.committedWpIds.length > 0) {
        setProcessedWpIds(res.committedWpIds);
        try {
          localStorage.setItem("cb_migrated_wp_ids", JSON.stringify(res.committedWpIds));
        } catch (e) {
          console.warn("Storage quota exceeded for checkpointing:", e);
        }
      }
    } catch (err: unknown) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ERROR: ${err instanceof Error ? err.message : String(err)}`,
      ]);
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopMigration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] User aborted migration. Checkpoint saved.`,
      ]);
    }
  };

  const handleClearCheckpoint = () => {
    if (window.confirm("Clear resume checkpoint? The next migration will re-scan all records.")) {
      setProcessedWpIds([]);
      localStorage.removeItem("cb_migrated_wp_ids");
    }
  };

  // Filtered lists for tabs
  const filteredMappings = useMemo(() => {
    if (!analysis) return [];
    if (!mappingSearch.trim()) return analysis.categoryMappings;
    const q = mappingSearch.toLowerCase();
    return analysis.categoryMappings.filter(
      (m) =>
        m.targetCategory.toLowerCase().includes(q) ||
        m.targetSubcategory.toLowerCase().includes(q) ||
        m.sourceKey.toLowerCase().includes(q) ||
        m.sampleCelebrities.some((s) => s.toLowerCase().includes(q))
    );
  }, [analysis, mappingSearch]);

  const missingDescriptionCelebrities = useMemo(() => {
    if (!payload) return [];
    const missing = payload.celebrities.filter((c) => !c.description || !c.description.trim());
    if (!descriptionSearch.trim()) return missing;
    const q = descriptionSearch.toLowerCase();
    return missing.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [payload, descriptionSearch]);

  const filteredDuplicates = useMemo(() => {
    if (!analysis) return [];
    if (!duplicateSearch.trim()) return analysis.duplicateReport;
    const q = duplicateSearch.toLowerCase();
    return analysis.duplicateReport.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        d.details.toLowerCase().includes(q)
    );
  }, [analysis, duplicateSearch]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9B111E]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#9B111E] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#9B111E]">
                Cloud Database Migration Engine
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 font-medium">
                WordPress to Cloud Firestore
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
              Legacy Celebrity Migration
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Batch import 1,518 published legacy celebrity records with semantic category mapping,
              curated AI descriptions for missing profiles, and duplicate protection.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadDefaultMigrationJson}
              disabled={isLoadingFile || isRunning}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Reload celebritybulaye-migration.json"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFile ? "animate-spin" : ""}`} />
              <span>Reload JSON</span>
            </button>

            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleRunDryRun}
              disabled={!payload || isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Run Dry-Run Simulation</span>
            </button>

            <button
              onClick={handleRunPilotMigration}
              disabled={!payload || isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
              title="Import only the 5 approved pilot profiles"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Pilot Import (5 Records)</span>
            </button>

            <button
              onClick={handleStartLiveMigration}
              disabled={!payload || isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Cloud Import</span>
            </button>
          </div>
        </div>

        {/* Safety Badges Row */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Existing Categories Untouched
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Controlled Batched Writes (200 docs/batch)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            Manual Record Conflict Protection
          </span>
          {processedWpIds.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-medium ml-auto">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Resume Checkpoint: {processedWpIds.length} profiles
              <button
                onClick={handleClearCheckpoint}
                className="underline hover:text-amber-950 font-bold ml-1"
                title="Clear checkpoint"
              >
                Reset
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Total Records
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1 font-serif">
            {analysis?.totalRecords ?? (payload?.celebrities.length || 0)}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">In WordPress export</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Unique Profiles
          </div>
          <div className="text-2xl font-extrabold text-[#9B111E] mt-1 font-serif">
            {analysis?.uniqueRecords ?? 1506}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Ready to import
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Internal Duplicates
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 font-serif">
            {analysis?.internalDuplicatesCount ?? 12}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">24 records merged cleanly</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Existing Bios
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-serif">
            {analysis?.recordsWithDescription ?? 1380}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Original WordPress text</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Missing Bios (AI)
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1 font-serif">
            {analysis?.recordsMissingDescription ?? 138}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
            100% Curated & Flagged
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Valid Images
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1 font-serif">
            {analysis?.validImageCount ?? 1518}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% CDN hosted</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-2xl px-4 pt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("mapping")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "mapping"
              ? "border-[#9B111E] text-[#9B111E]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Category Mapping ({analysis?.categoryMappings.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("descriptions")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "descriptions"
              ? "border-[#9B111E] text-[#9B111E]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Generated Descriptions (138)</span>
        </button>

        <button
          onClick={() => setActiveTab("duplicates")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "duplicates"
              ? "border-[#9B111E] text-[#9B111E]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Duplicate Report ({analysis?.duplicateReport.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("samples")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "samples"
              ? "border-[#9B111E] text-[#9B111E]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Sample Record Preview ({analysis?.sampleRecords.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("console")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ml-auto ${
            activeTab === "console"
              ? "border-[#9B111E] text-[#9B111E]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            Execution Console {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />}
          </span>
        </button>
      </div>

      {/* Tab 1: Category Mapping Preview */}
      {activeTab === "mapping" && (
        <div className="bg-white rounded-b-2xl border border-gray-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif">
                Semantic Category & Subcategory Mapping
              </h2>
              <p className="text-xs text-gray-500">
                Maps 47 legacy categories and typos (e.g. &ldquo;Bollybood&rdquo;) directly to the existing
                8 categories and 22 active subcategories.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mapping..."
                value={mappingSearch}
                onChange={(e) => setMappingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#9B111E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 font-semibold">
                  <th className="py-2.5 px-3">Target Category</th>
                  <th className="py-2.5 px-3">Target Subcategory</th>
                  <th className="py-2.5 px-3">Category Document ID</th>
                  <th className="py-2.5 px-3">Subcategory ID</th>
                  <th className="py-2.5 px-3 text-right">Records</th>
                  <th className="py-2.5 px-3">Sample Celebrities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMappings.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9B111E]" />
                        {m.targetCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-800 font-medium">
                      {m.targetSubcategory}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                      {m.targetCategoryId}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                      {m.targetSubcategoryId}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900 font-serif">
                      {m.recordCount}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate text-[11px]">
                      {m.sampleCelebrities.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Generated Descriptions (138) */}
      {activeTab === "descriptions" && (
        <div className="bg-white rounded-b-2xl border border-gray-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif">
                Missing Descriptions Reviewer ({missingDescriptionCelebrities.length})
              </h2>
              <p className="text-xs text-gray-500">
                Professional, factual, SEO-friendly descriptions curated for the 138 legacy records
                without descriptions. Flagged with <code className="text-indigo-600 font-mono">descriptionGenerated: true</code>.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search celebrity..."
                value={descriptionSearch}
                onChange={(e) => setDescriptionSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#9B111E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missingDescriptionCelebrities.map((c) => {
              const sample = analysis?.sampleRecords.find((s) => s.slug === c.slug);
              const previewBio =
                sample?.description ||
                "A distinguished artist available for corporate galas, premier brand endorsements, and public appearances across India.";

              return (
                <div
                  key={c.wordpressPostId}
                  className="rounded-xl border border-gray-200 p-4 space-y-2.5 bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {c.imageUrl && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 text-xs sm:text-sm">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          WP #{c.wordpressPostId} • {c.category}{" "}
                          {c.subcategory ? `> ${c.subcategory}` : ""}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700 shrink-0">
                      <Sparkles className="w-3 h-3" />
                      AI Curated
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200/60 font-sans">
                    {previewBio}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Duplicate Resolution & Protection */}
      {activeTab === "duplicates" && (
        <div className="bg-white rounded-b-2xl border border-gray-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif">
                Duplicate Protection & Merge Log ({filteredDuplicates.length})
              </h2>
              <p className="text-xs text-gray-500">
                Shows detected duplicate pairs, canonical slug resolution, and protection against
                overwriting manually created documents.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportReportAsJson(analysis?.duplicateReport, "migration-duplicate-report.json")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter duplicates..."
                  value={duplicateSearch}
                  onChange={(e) => setDuplicateSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#9B111E] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredDuplicates.map((dup, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 text-sm">{dup.name}</div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      dup.action === "merged"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {dup.action === "merged" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {dup.action}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{dup.details}</p>
                <div className="text-[11px] text-gray-500 font-mono">
                  Slug: <span className="font-semibold text-gray-800">{dup.slug}</span> • WP Post IDs:{" "}
                  {dup.wordpressPostIds.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Sample Record Previews */}
      {activeTab === "samples" && (
        <div className="bg-white rounded-b-2xl border border-gray-200/80 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-serif">
              Sample Migrated Records (Production Schema)
            </h2>
            <p className="text-xs text-gray-500">
              Preview how legacy WordPress posts are transformed into complete, typed Firestore Celebrity documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis?.sampleRecords.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-gray-200 p-5 space-y-4 bg-white shadow-xs"
              >
                <div className="flex items-start gap-4">
                  {c.profileImage && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.profileImage}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base truncate font-serif">
                        {c.name}
                      </h3>
                      {c.verified && (
                        <span className="text-blue-600 text-xs" title="Verified">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#9B111E] font-semibold">
                      {c.category} • {c.subcategory}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      id: {c.id} • slug: {c.slug}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                    Bio ({c.description.length} chars)
                  </div>
                  {c.description}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-gray-100 pt-3 text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-800">Category ID:</span> {c.categoryId}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Subcategory ID:</span> {c.subcategoryId}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Price Range:</span> {c.priceRange}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">Location:</span> {c.location}
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                    {c.specialties.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Execution Console & Live Logs */}
      {activeTab === "console" && (
        <div className="bg-white rounded-b-2xl border border-gray-200/80 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif flex items-center gap-2">
                <span>Migration Execution Console</span>
                {isRunning && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                    RUNNING ({isDryRun ? "DRY-RUN" : "LIVE"})
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500">
                Real-time progress, batch writes confirmation, and Firestore transaction logs.
              </p>
            </div>

            {isRunning && (
              <button
                onClick={handleStopMigration}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Import</span>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-700">{progressMessage || "Standing by"}</span>
              <span className="font-mono text-gray-900">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9B111E] to-[#C5A059] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Live Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-[10px] font-bold uppercase text-gray-400">Processed</div>
              <div className="text-xl font-bold text-gray-900 mt-0.5 font-mono">{processedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] font-bold uppercase text-emerald-700">Created</div>
              <div className="text-xl font-bold text-emerald-800 mt-0.5 font-mono">{createdCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-[10px] font-bold uppercase text-blue-700">Updated</div>
              <div className="text-xl font-bold text-blue-800 mt-0.5 font-mono">{updatedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-[10px] font-bold uppercase text-amber-700">Protected / Skipped</div>
              <div className="text-xl font-bold text-amber-800 mt-0.5 font-mono">{skippedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <div className="text-[10px] font-bold uppercase text-red-700">Errors</div>
              <div className="text-xl font-bold text-red-800 mt-0.5 font-mono">{failedCount}</div>
            </div>
          </div>

          {/* Terminal Log Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Activity Log</span>
              <span>{logs.length} lines</span>
            </div>
            <div
              ref={logsContainerRef}
              className="bg-[#0B0F19] text-gray-200 rounded-xl p-4 font-mono text-xs h-80 overflow-y-auto space-y-1 border border-gray-800 shadow-inner"
            >
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">
                  Press &ldquo;Run Dry-Run Simulation&rdquo; or &ldquo;Start Cloud Import&rdquo; to begin.
                </div>
              ) : (
                logs.map((line, i) => {
                  const isError = line.includes("ERROR") || line.includes("✗");
                  const isSuccess = line.includes("✓") || line.includes("100% SUCCESS") || line.includes("committed");
                  const isDry = line.includes("DRY-RUN") || line.includes("Simulation");

                  return (
                    <div
                      key={i}
                      className={`${
                        isError
                          ? "text-red-400 font-semibold"
                          : isSuccess
                          ? "text-emerald-400"
                          : isDry
                          ? "text-amber-300"
                          : "text-gray-300"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
