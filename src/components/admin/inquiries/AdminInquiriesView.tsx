"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Mail,
  Phone,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  User,
  MapPin,
  Calendar,
  X,
  Send,
  HelpCircle,
  ChevronRight,
  ArrowUpDown,
  Building,
} from "lucide-react";
import { Inquiry, InquiryStatus, InquiryType, FormspreeStatus } from "@/types/inquiry";
import { useAdminAuth } from "@/context/AuthContext";
import {
  fetchAdminInquiries,
  updateAdminInquiryStatus,
  updateAdminInquiryNotes,
  deleteAdminInquiry,
  retryAdminFormspree,
  subscribeInquiriesFromFirestore,
  getStoredInquiriesSync,
} from "@/services/bookingService";
import { Toast, ToastMessage } from "@/components/admin/Toast";

export function AdminInquiriesView() {
  const { user } = useAdminAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | InquiryType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");
  const [formspreeFilter, setFormspreeFilter] = useState<"all" | FormspreeStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  // Selection & Modals
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isRetryingFormspree, setIsRetryingFormspree] = useState(false);

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  }, []);

  // Fetch inquiries from server
  const loadInquiries = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      setError(null);

      try {
        const token = user ? await user.getIdToken() : undefined;
        const data = await fetchAdminInquiries(token);
        setInquiries(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load inquiries.";
        setError(msg);
        showToast("error", msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user, showToast]
  );

  // Initial load & real-time Firestore subscription
  useEffect(() => {
    // Initial sync from local storage if available for instant render
    const initial = getStoredInquiriesSync();
    if (initial.length > 0) {
      setInquiries(initial);
      setIsLoading(false);
    }

    loadInquiries();

    // Subscribe to live updates
    const unsubscribe = subscribeInquiriesFromFirestore((liveList) => {
      if (liveList && liveList.length >= 0) {
        setInquiries(liveList);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadInquiries]);

  // When selectedInquiry changes, sync notes input
  useEffect(() => {
    if (selectedInquiry) {
      setAdminNotesInput(selectedInquiry.adminNotes || "");
    }
  }, [selectedInquiry]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === "new" || !i.status).length;
    const inProgress = inquiries.filter((i) => i.status === "in_progress").length;
    const completed = inquiries.filter((i) => i.status === "completed").length;
    const rejected = inquiries.filter((i) => i.status === "rejected").length;
    const contactCount = inquiries.filter((i) => i.inquiryType === "contact").length;
    const bookingCount = inquiries.filter((i) => i.inquiryType === "celebrity_booking").length;

    return { total, newCount, inProgress, completed, rejected, contactCount, bookingCount };
  }, [inquiries]);

  // Filtered & sorted inquiries
  const filteredInquiries = useMemo(() => {
    let result = [...inquiries];

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((i) => i.inquiryType === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((i) => (i.status || "new") === statusFilter);
    }

    // Formspree filter
    if (formspreeFilter !== "all") {
      result = result.filter((i) => (i.formspreeStatus || "pending") === formspreeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((i) => {
        const name = (i.customerName || i.fullName || "").toLowerCase();
        const email = (i.email || "").toLowerCase();
        const phone = (i.phone || "").toLowerCase();
        const celeb = (i.celebrityName || "").toLowerCase();
        const id = (i.id || "").toLowerCase();
        const subject = (i.subject || "").toLowerCase();
        const location = (i.eventLocation || "").toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          celeb.includes(q) ||
          id.includes(q) ||
          subject.includes(q) ||
          location.includes(q)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sortBy === "name") {
        const nameA = (a.customerName || a.fullName || "").toLowerCase();
        const nameB = (b.customerName || b.fullName || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      // default: newest
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return result;
  }, [inquiries, typeFilter, statusFilter, formspreeFilter, searchQuery, sortBy]);

  // Handlers
  const handleStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      const token = user ? await user.getIdToken() : undefined;
      await updateAdminInquiryStatus(inquiryId, newStatus, token);

      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i))
      );

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      showToast("success", `Inquiry status changed to ${newStatus.replace("_", " ")}.`);
    } catch {
      showToast("error", "Failed to update inquiry status.");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    try {
      const token = user ? await user.getIdToken() : undefined;
      await updateAdminInquiryNotes(selectedInquiry.id, adminNotesInput, token);

      setInquiries((prev) =>
        prev.map((i) =>
          i.id === selectedInquiry.id ? { ...i, adminNotes: adminNotesInput } : i
        )
      );

      setSelectedInquiry((prev) => (prev ? { ...prev, adminNotes: adminNotesInput } : null));
      showToast("success", "Admin notes saved successfully.");
    } catch {
      showToast("error", "Failed to save internal admin notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleRetryFormspree = async (inquiry: Inquiry) => {
    setIsRetryingFormspree(true);
    try {
      const token = user ? await user.getIdToken() : undefined;
      const res = await retryAdminFormspree(inquiry.id, token);

      if (res.success) {
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === inquiry.id
              ? { ...i, formspreeStatus: "sent", formspreeError: undefined }
              : i
          )
        );
        if (selectedInquiry?.id === inquiry.id) {
          setSelectedInquiry((prev) =>
            prev ? { ...prev, formspreeStatus: "sent", formspreeError: undefined } : null
          );
        }
        showToast("success", "Formspree submission forwarded successfully!");
      } else {
        showToast("error", res.message || "Formspree forwarding failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Retry failed.";
      showToast("error", msg);
    } finally {
      setIsRetryingFormspree(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = user ? await user.getIdToken() : undefined;
      await deleteAdminInquiry(deleteTarget.id, token);

      setInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      if (selectedInquiry?.id === deleteTarget.id) {
        setSelectedInquiry(null);
      }
      showToast("success", `Inquiry ${deleteTarget.id} deleted successfully.`);
      setDeleteTarget(null);
    } catch {
      showToast("error", "Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      showToast("info", "No inquiries available to export.");
      return;
    }

    const headers = [
      "Inquiry ID",
      "Type",
      "Customer Name",
      "Phone",
      "Email",
      "Celebrity / Subject",
      "Event Type",
      "Event Date",
      "Location",
      "Budget",
      "Audience Count",
      "Status",
      "Formspree Status",
      "Submission Date (IST)",
      "Source Page",
      "Message",
      "Admin Notes",
    ];

    const rows = filteredInquiries.map((i) => [
      `"${i.id}"`,
      `"${i.inquiryType}"`,
      `"${(i.customerName || i.fullName || "").replace(/"/g, '""')}"`,
      `"${i.phone || ""}"`,
      `"${i.email || ""}"`,
      `"${(i.celebrityName || i.subject || "").replace(/"/g, '""')}"`,
      `"${(i.eventType || "").replace(/"/g, '""')}"`,
      `"${i.eventDate || ""}"`,
      `"${(i.eventLocation || "").replace(/"/g, '""')}"`,
      `"${i.budget || i.budgetRange || ""}"`,
      `"${i.audienceCount || ""}"`,
      `"${i.status || "new"}"`,
      `"${i.formspreeStatus || "pending"}"`,
      `"${new Date(i.submittedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}"`,
      `"${i.sourcePage || ""}"`,
      `"${(i.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${(i.adminNotes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `celebrity-bulaye-inquiries-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("success", `Exported ${filteredInquiries.length} inquiries to CSV.`);
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const digits = phone.replace(/[^0-9]/g, "");
    const formatted = digits.length === 10 ? `91${digits}` : digits;
    const msg = `Hello ${name}, thank you for contacting Celebrity Bulaye. How can we assist you with your inquiry?`;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-0.5 w-4 bg-[#9B111E]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9B111E]">
              Client Inquiries CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif tracking-tight">
            Inquiries & Booking Leads
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time contact messages and celebrity booking requests submitted by visitors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadInquiries(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#9B111E]" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B0F19] text-white hover:bg-gray-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 font-serif">{stats.total}</div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">All submissions</span>
        </div>

        {/* New */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">New</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-900 font-serif">{stats.newCount}</div>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Requires attention</span>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-2xs bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-900 font-serif">{stats.inProgress}</div>
          <span className="text-[10px] text-blue-600 mt-0.5 block">Under discussion</span>
        </div>

        {/* Celebrity Booking */}
        <div className="bg-white rounded-2xl p-4 border border-red-200/80 shadow-2xs bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-center justify-between text-[#9B111E] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bookings</span>
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-[#9B111E]">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-950 font-serif">{stats.bookingCount}</div>
          <span className="text-[10px] text-red-600 mt-0.5 block">Specific artists</span>
        </div>

        {/* Contact Us */}
        <div className="bg-white rounded-2xl p-4 border border-purple-200/80 shadow-2xs bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Contact</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-800">
              <Mail className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-900 font-serif">{stats.contactCount}</div>
          <span className="text-[10px] text-purple-600 mt-0.5 block">General inquiries</span>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-2xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 font-serif">{stats.completed}</div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Closed deals</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs space-y-4">
        {/* Top Search & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, email, phone, celebrity, ID..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | InquiryType)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] focus:bg-white transition-colors text-gray-700"
            >
              <option value="all">All Inquiry Types ({stats.total})</option>
              <option value="celebrity_booking">Celebrity Booking Requests ({stats.bookingCount})</option>
              <option value="contact">Contact Us / General ({stats.contactCount})</option>
            </select>
          </div>

          {/* Formspree Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={formspreeFilter}
              onChange={(e) => setFormspreeFilter(e.target.value as "all" | FormspreeStatus)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] focus:bg-white transition-colors text-gray-700"
            >
              <option value="all">All Delivery Status</option>
              <option value="sent">Delivered to Formspree</option>
              <option value="failed">Delivery Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name")}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] focus:bg-white transition-colors text-gray-700"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: Customer Name</option>
            </select>
          </div>
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-100 no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-2 shrink-0">
            Status:
          </span>
          {[
            { id: "all", label: "All Inquiries", count: stats.total },
            { id: "new", label: "New", count: stats.newCount },
            { id: "in_progress", label: "In Progress", count: stats.inProgress },
            { id: "completed", label: "Completed", count: stats.completed },
            { id: "rejected", label: "Rejected", count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as "all" | InquiryStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#9B111E] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#9B111E]" />
            <p className="text-sm font-semibold text-gray-700">Loading inquiries from database...</p>
            <p className="text-xs text-gray-400 mt-1">Fetching live Firestore records</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-800 font-serif">No Inquiries Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                ? "No inquiries matched your current filter criteria. Try clearing search or filters."
                : "No customer booking requests or contact submissions have been recorded yet."}
            </p>
            {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setFormspreeFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4">Ref ID & Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Details / Requirements</th>
                  <th className="py-3.5 px-4">Formspree</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredInquiries.map((inquiry) => {
                  const isBooking = inquiry.inquiryType === "celebrity_booking";
                  const status = inquiry.status || "new";
                  const formspree = inquiry.formspreeStatus || "pending";

                  return (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      {/* Ref ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-gray-900 text-[11px]">
                          {inquiry.id}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {formatDate(inquiry.submittedAt)}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isBooking ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-[#9B111E] border border-red-200/60">
                            <Sparkles className="w-3 h-3" />
                            <span>Booking Request</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                            <Mail className="w-3 h-3" />
                            <span>Contact Us</span>
                          </span>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="font-bold text-gray-900">
                          {inquiry.customerName || inquiry.fullName || "Anonymous"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                          <a
                            href={`tel:${(inquiry.phone || "").replace(/\s+/g, "")}`}
                            className="hover:text-[#9B111E] flex items-center gap-1 font-mono"
                            title="Click to Call"
                          >
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{inquiry.phone}</span>
                          </a>
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[200px]">
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="hover:underline hover:text-gray-700"
                          >
                            {inquiry.email}
                          </a>
                        </div>
                      </td>

                      {/* Inquiry Requirements */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {isBooking ? (
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span className="text-[#9B111E]">★</span>
                              <span>{inquiry.celebrityName || "General Artist"}</span>
                            </div>
                            <div className="text-[11px] text-gray-600 mt-0.5">
                              <span>{inquiry.eventType || "Event"}</span>
                              {inquiry.eventDate && <span> • {inquiry.eventDate}</span>}
                              {inquiry.eventLocation && <span> ({inquiry.eventLocation})</span>}
                            </div>
                            {inquiry.budget && (
                              <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                                Budget: {inquiry.budget}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-gray-800 truncate">
                              {inquiry.subject || "General Booking Inquiry"}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                              {inquiry.message}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Formspree Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {formspree === "sent" ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                            title="Forwarded successfully to Formspree"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Delivered</span>
                          </span>
                        ) : formspree === "failed" ? (
                          <button
                            type="button"
                            onClick={() => handleRetryFormspree(inquiry)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                            title={`Failed: ${inquiry.formspreeError || "Unknown error"}. Click to retry.`}
                          >
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>Failed (Retry)</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(inquiry.id, e.target.value as InquiryStatus)
                          }
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                            status === "new"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : status === "in_progress"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : status === "completed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Direct */}
                          <a
                            href={getWhatsAppLink(
                              inquiry.phone,
                              inquiry.customerName || inquiry.fullName || "Customer"
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(inquiry)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-700 transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#0B0F19] to-gray-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-[#FFE5A3] bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60 font-bold">
                    {selectedInquiry.id}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(selectedInquiry.submittedAt)}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif">
                  {selectedInquiry.inquiryType === "celebrity_booking"
                    ? `Booking Request: ${selectedInquiry.celebrityName || "Celebrity"}`
                    : `Contact Inquiry: ${selectedInquiry.subject || "General"}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Communication Banner */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#9B111E] flex items-center justify-center font-bold text-sm">
                    {(selectedInquiry.customerName || selectedInquiry.fullName || "C")[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {selectedInquiry.customerName || selectedInquiry.fullName}
                    </h4>
                    <p className="text-xs text-gray-500">{selectedInquiry.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${(selectedInquiry.phone || "").replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span>Email</span>
                  </a>
                  <a
                    href={getWhatsAppLink(
                      selectedInquiry.phone,
                      selectedInquiry.customerName || selectedInquiry.fullName || "Customer"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Event / Service Details (if Booking) */}
              {selectedInquiry.inquiryType === "celebrity_booking" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Event Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Requested Artist
                      </span>
                      <span className="font-bold text-[#9B111E] text-sm">
                        {selectedInquiry.celebrityName}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Event Type
                      </span>
                      <span className="font-semibold text-gray-800">
                        {selectedInquiry.eventType || "Not specified"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Event Date
                      </span>
                      <span className="font-semibold text-gray-800">
                        {selectedInquiry.eventDate || "TBD"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Location / City
                      </span>
                      <span className="font-semibold text-gray-800">
                        {selectedInquiry.eventLocation || "TBD"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Audience Count
                      </span>
                      <span className="font-semibold text-gray-800">
                        {selectedInquiry.audienceCount || "N/A"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Budget Range
                      </span>
                      <span className="font-bold text-emerald-700">
                        {selectedInquiry.budget || selectedInquiry.budgetRange || "Negotiable"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Message / Brief */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Customer Message / Requirements
                </h4>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message || "No additional message provided."}
                </div>
              </div>

              {/* Formspree Delivery & Technical Audit */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Formspree Integration Status
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRetryFormspree(selectedInquiry)}
                    disabled={isRetryingFormspree}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#9B111E] hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetryingFormspree ? "animate-spin" : ""}`} />
                    <span>{isRetryingFormspree ? "Retrying..." : "Resend to Formspree"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Endpoint
                    </span>
                    <span className="font-mono text-gray-700 text-[11px]">
                      {selectedInquiry.inquiryType === "contact"
                        ? "formspree.io/f/mljeyaoe (Contact)"
                        : "formspree.io/f/mwlokrov (Booking)"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Delivery Result
                    </span>
                    <span
                      className={`font-bold ${
                        selectedInquiry.formspreeStatus === "sent"
                          ? "text-emerald-700"
                          : selectedInquiry.formspreeStatus === "failed"
                          ? "text-red-700"
                          : "text-amber-700"
                      }`}
                    >
                      {selectedInquiry.formspreeStatus === "sent"
                        ? "✓ Successfully Forwarded to Email"
                        : selectedInquiry.formspreeStatus === "failed"
                        ? `✗ Failed: ${selectedInquiry.formspreeError || "Network / Config Error"}`
                        : "⏳ Pending Delivery"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Source Page Origin
                    </span>
                    <span className="font-mono text-gray-700 text-[11px]">
                      {selectedInquiry.sourcePage || "/"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      Submission Timestamp
                    </span>
                    <span className="text-gray-700 text-[11px]">
                      {formatDate(selectedInquiry.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Internal Notes Editor */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Inquiry Lifecycle Status
                  </label>
                  <select
                    value={selectedInquiry.status || "new"}
                    onChange={(e) =>
                      handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)
                    }
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                    Internal Admin Notes (Private)
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Enter private coordinator notes, artist negotiation comments, deal progress..."
                    className="w-full p-3 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="px-4 py-2 bg-[#9B111E] hover:bg-[#740D16] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {isSavingNotes ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Notes...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Save Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(selectedInquiry);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Inquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                Delete Inquiry {deleteTarget.id}?
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Are you sure you want to delete the inquiry from{" "}
                <strong className="text-gray-900">
                  {deleteTarget.customerName || deleteTarget.fullName}
                </strong>
                ? This action removes the document from Firestore permanently.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

