import { BookingInquiryFormData, ArtistApplicationFormData } from "@/types";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";

export interface BookingSubmissionResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
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
  status?: "new" | "pending" | "contacted" | "confirmed" | "cancelled";
}

function cleanFirestoreData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Synchronous read of locally stored customer inquiries for the admin dashboard.
 */
export function getStoredInquiriesSync(): StoredBookingInquiry[] {
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
 * Fetch inquiries from Firestore (requires authenticated Admin).
 */
export async function fetchInquiriesFromFirestore(): Promise<StoredBookingInquiry[]> {
  if (!db) return getStoredInquiriesSync();
  try {
    const snapshot = await getDocs(collection(db, "inquiries"));
    if (snapshot.empty) return getStoredInquiriesSync();
    const list: StoredBookingInquiry[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as StoredBookingInquiry);
    });
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cb_mock_inquiries", JSON.stringify(list));
      } catch {}
    }
    return list;
  } catch (err) {
    console.warn("[Firestore] Inquiries fetch warning (admin permissions required):", err);
    return getStoredInquiriesSync();
  }
}

/**
 * Subscribe to inquiries from Firestore for real-time admin notification.
 */
export function subscribeInquiriesFromFirestore(
  callback: (inquiries: StoredBookingInquiry[]) => void
): Unsubscribe | null {
  if (!db || typeof window === "undefined") return null;
  try {
    return onSnapshot(
      collection(db, "inquiries"),
      (snapshot) => {
        const list: StoredBookingInquiry[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as StoredBookingInquiry);
        });
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        callback(list);
      },
      (err) => {
        console.warn("[Firestore] Inquiries listener warning:", err.message);
      }
    );
  } catch {
    return null;
  }
}

/**
 * Update an inquiry's status in Firestore.
 */
export async function updateInquiryStatus(
  id: string,
  status: "new" | "pending" | "contacted" | "confirmed" | "cancelled"
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const existing = getStoredInquiriesSync();
      const updated = existing.map((i) => (i.id === id ? { ...i, status } : i));
      localStorage.setItem("cb_mock_inquiries", JSON.stringify(updated));
    } catch {}
  }
  if (!db) return;
  try {
    await updateDoc(doc(db, "inquiries", id), { status });
  } catch (err) {
    console.warn(`[Firestore] Failed to update inquiry status ${id}:`, err);
  }
}

/**
 * Submit booking inquiry to Firestore and local storage.
 */
export async function submitBookingInquiry(
  data: BookingInquiryFormData
): Promise<BookingSubmissionResponse> {
  // Basic validation check
  if (!data.fullName || !data.phone || !data.email || !data.eventType || !data.eventDate || !data.eventLocation) {
    throw new Error("Please complete all required fields (*).");
  }

  const generatedId = `INQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
  const inquiryRecord: StoredBookingInquiry = {
    ...data,
    id: generatedId,
    submittedAt: new Date().toISOString(),
    status: "new",
  };

  // 1. Submit to Firestore backend
  if (db) {
    try {
      const docRef = doc(db, "inquiries", generatedId);
      await setDoc(docRef, cleanFirestoreData(inquiryRecord));
    } catch (err) {
      console.warn("[Firestore] Direct write failed, falling back to local queue:", err);
    }
  }

  // 2. Store in local storage for fallback / offline demonstration
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("cb_mock_inquiries") || "[]");
      existing.unshift(inquiryRecord);
      localStorage.setItem("cb_mock_inquiries", JSON.stringify(existing));
    } catch {
      // Ignore localStorage issues in private windows
    }
  }

  return {
    success: true,
    message: "Thank you for your inquiry. Our senior celebrity talent manager will contact you within 2-4 business hours.",
    inquiryId: generatedId,
    details: data,
  };
}

export async function submitArtistApplication(
  data: ArtistApplicationFormData
): Promise<ApplicationSubmissionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!data.fullName || !data.phone || !data.email || !data.category) {
    throw new Error("Please fill out your name, contact information, and primary category.");
  }

  const generatedId = `ART-${Date.now().toString(36).toUpperCase()}`;

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("cb_mock_applications") || "[]");
      existing.push({ id: generatedId, ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem("cb_mock_applications", JSON.stringify(existing));
    } catch {
      // Ignore
    }
  }

  return {
    success: true,
    message: "Your artist application has been submitted successfully! Our talent onboarding committee will review your profile.",
    applicationId: generatedId,
  };
}

export async function submitContactMessage(data: {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!data.name || !data.email || !data.message) {
    throw new Error("Please provide your name, email, and message.");
  }

  return {
    success: true,
    message: "Thank you for reaching out to Celebrity Bulaye! We have received your message and will respond shortly.",
  };
}
