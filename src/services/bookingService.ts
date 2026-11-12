import { BookingInquiryFormData, ArtistApplicationFormData } from "@/types";
import { Inquiry, InquiryStatus, FormspreeStatus } from "@/types/inquiry";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

export interface BookingSubmissionResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
  formspreeStatus?: FormspreeStatus;
  details?: BookingInquiryFormData;
}

export interface ApplicationSubmissionResponse {
  success: boolean;
  message: string;
  applicationId?: string;
}

export interface StoredBookingInquiry extends BookingInquiryFormData {
  id: string;
  submittedAt: string;
  status?: "new" | "pending" | "contacted" | "confirmed" | "cancelled" | InquiryStatus;
  formspreeStatus?: FormspreeStatus;
  adminNotes?: string;
}

/**
 * Synchronous read of locally stored customer inquiries for the admin dashboard.
 */
export function getStoredInquiriesSync(): Inquiry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem("cb_mock_inquiries");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Fetch inquiries from Firestore via authenticated Admin API route.
 */
export async function fetchAdminInquiries(token?: string): Promise<Inquiry[]> {
  try {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch("/api/admin/inquiries", { headers });
    const json = await res.json();
    if (json.success && Array.isArray(json.inquiries)) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("cb_mock_inquiries", JSON.stringify(json.inquiries));
        } catch {}
      }
      return json.inquiries;
    }
  } catch (err) {
    console.warn("[bookingService] Admin inquiries API fetch failed, falling back to direct Firestore:", err);
  }

  return fetchInquiriesFromFirestore();
}

/**
 * Direct client Firestore fetch fallback for authenticated Admin.
 */
export async function fetchInquiriesFromFirestore(): Promise<Inquiry[]> {
  if (!db) return getStoredInquiriesSync();
  try {
    const snapshot = await getDocs(collection(db, "inquiries"));
    if (snapshot.empty) return getStoredInquiriesSync();
    const list: Inquiry[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        customerName: data.customerName || data.fullName || "Customer",
        ...data,
      } as Inquiry);
    });
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cb_mock_inquiries", JSON.stringify(list));
      } catch {}
    }
    return list;
  } catch (err) {
    console.warn("[Firestore] Inquiries fetch notice:", err);
    return getStoredInquiriesSync();
  }
}

/**
 * Subscribe to inquiries from Firestore for real-time admin notification.
 */
export function subscribeInquiriesFromFirestore(
  callback: (inquiries: Inquiry[]) => void
): Unsubscribe | null {
  if (!db || typeof window === "undefined") return null;
  try {
    return onSnapshot(
      collection(db, "inquiries"),
      (snapshot) => {
        const list: Inquiry[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            customerName: data.customerName || data.fullName || "Customer",
            ...data,
          } as Inquiry);
        });
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        callback(list);
      },
      (err) => {
        console.warn("[Firestore] Inquiries listener notice:", err.message);
      }
    );
  } catch {
    return null;
  }
}

/**
 * Update an inquiry's status via Admin API (with direct Firestore fallback).
 */
export async function updateAdminInquiryStatus(
  id: string,
  status: InquiryStatus,
  token?: string
): Promise<void> {
  // Update local storage for immediate UI response
  if (typeof window !== "undefined") {
    try {
      const existing = getStoredInquiriesSync();
      const updated = existing.map((i) => (i.id === id ? { ...i, status } : i));
      localStorage.setItem("cb_mock_inquiries", JSON.stringify(updated));
    } catch {}
  }

  // 1. Try server-side Admin API
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("[bookingService] Admin API status update error, trying direct write:", err);
  }

  // 2. Direct Firestore fallback
  if (db) {
    try {
      await updateDoc(doc(db, "inquiries", id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn(`[Firestore] Failed to update inquiry status ${id}:`, err);
    }
  }
}

/**
 * Update internal admin notes for an inquiry.
 */
export async function updateAdminInquiryNotes(
  id: string,
  adminNotes: string,
  token?: string
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = getStoredInquiriesSync();
      const updated = existing.map((i) => (i.id === id ? { ...i, adminNotes } : i));
      localStorage.setItem("cb_mock_inquiries", JSON.stringify(updated));
    } catch {}
  }

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ adminNotes }),
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("[bookingService] Admin API notes update error, trying direct write:", err);
  }

  if (db) {
    try {
      await updateDoc(doc(db, "inquiries", id), {
        adminNotes,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn(`[Firestore] Failed to update inquiry notes ${id}:`, err);
    }
  }
}

/**
 * Delete an inquiry via Admin API (with direct Firestore fallback).
 */
export async function deleteAdminInquiry(id: string, token?: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = getStoredInquiriesSync();
      const filtered = existing.filter((i) => i.id !== id);
      localStorage.setItem("cb_mock_inquiries", JSON.stringify(filtered));
    } catch {}
  }

  try {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) return;
  } catch (err) {
    console.warn("[bookingService] Admin API delete error, trying direct delete:", err);
  }

  if (db) {
    try {
      await deleteDoc(doc(db, "inquiries", id));
    } catch (err) {
      console.warn(`[Firestore] Failed to delete inquiry ${id}:`, err);
    }
  }
}

/**
 * Retry Formspree forwarding for an inquiry via Admin API.
 */
export async function retryAdminFormspree(
  id: string,
  token?: string
): Promise<{ success: boolean; message: string; formspreeStatus?: FormspreeStatus }> {
  try {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`/api/admin/inquiries/${id}/retry-formspree`, {
      method: "POST",
      headers,
    });
    const json = await res.json();
    return json;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Retry failed: ${msg}` };
  }
}

// Backwards compatibility alias
export const updateInquiryStatus = updateAdminInquiryStatus;

/**
 * Submit celebrity booking inquiry through the secure server-side API.
 * Performs validation, saves to Firestore, and forwards to Formspree endpoint (mwlokrov).
 */
export async function submitBookingInquiry(
  data: BookingInquiryFormData
): Promise<BookingSubmissionResponse> {
  const payload = {
    inquiryType: "celebrity_booking",
    customerName: data.fullName,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    celebrityName: data.celebrityName,
    celebrityId: data.celebrityId,
    eventType: data.eventType,
    eventDate: data.eventDate,
    eventLocation: data.eventLocation,
    budget: data.budgetRange,
    budgetRange: data.budgetRange,
    audienceCount: data.audienceCount,
    message: data.message,
    sourcePage: typeof window !== "undefined" ? window.location.pathname : `/celebrity/${data.celebrityId || ""}`,
    _gotcha: data._gotcha,
  };

  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to submit booking inquiry. Please try again.");
  }

  return {
    success: true,
    message: result.message || "Your booking inquiry has been received successfully. Our team will contact you shortly.",
    inquiryId: result.inquiryId,
    formspreeStatus: result.formspreeStatus,
    details: data,
  };
}

/**
 * Submit contact message through the secure server-side API.
 * Performs validation, saves to Firestore, and forwards to Formspree endpoint (mljeyaoe).
 */
export async function submitContactMessage(data: {
  name: string;
  phone: string;
  email: string;
  subject?: string;
  message: string;
  sourcePage?: string;
  _gotcha?: string;
}): Promise<{ success: boolean; message: string; inquiryId?: string; formspreeStatus?: FormspreeStatus }> {
  const payload = {
    inquiryType: "contact",
    customerName: data.name,
    fullName: data.name,
    phone: data.phone,
    email: data.email,
    subject: data.subject || "General Booking Inquiry",
    message: data.message,
    sourcePage: data.sourcePage || (typeof window !== "undefined" ? window.location.pathname : "/contact"),
    _gotcha: data._gotcha,
  };

  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to send contact message. Please try again.");
  }

  return {
    success: true,
    message: result.message || "Thank you for contacting Celebrity Bulaye! Your inquiry has been submitted successfully. Our team will get in touch with you soon.",
    inquiryId: result.inquiryId,
    formspreeStatus: result.formspreeStatus,
  };
}

export async function submitArtistApplication(
  data: ArtistApplicationFormData
): Promise<ApplicationSubmissionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!data.fullName || !data.phone || !data.email || !data.category) {
    throw new Error("Please fill out your name, contact information, and primary category.");
  }

  const generatedId = `ART-${Date.now().toString(36).toUpperCase()}`;

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("cb_mock_applications") || "[]");
      existing.push({ id: generatedId, ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem("cb_mock_applications", JSON.stringify(existing));
    } catch {}
  }

  return {
    success: true,
    message: "Your artist application has been submitted successfully! Our talent onboarding committee will review your profile.",
    applicationId: generatedId,
  };
}
