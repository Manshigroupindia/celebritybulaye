import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuthorization } from "@/lib/adminAuth";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Inquiry } from "@/types/inquiry";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// Universal Formspree endpoint for all inquiries
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mwlokrov";

/**
 * POST /api/admin/inquiries/[id]/retry-formspree
 * Retries forwarding a stored inquiry to Formspree.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const authCheck = await verifyAdminAuthorization(req);
  if (!authCheck.authorized) {
    return NextResponse.json(
      { success: false, error: authCheck.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing inquiry ID." }, { status: 400 });
  }

  try {
    let inquiryData: Inquiry | null = null;

    // 1. Fetch document from Firestore
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const snap = await adminDb.collection("inquiries").doc(id).get();
      if (snap.exists) {
        inquiryData = { id: snap.id, ...snap.data() } as Inquiry;
      }
    } else if (db) {
      const snap = await getDoc(doc(db, "inquiries", id));
      if (snap.exists()) {
        inquiryData = { id: snap.id, ...snap.data() } as Inquiry;
      }
    }

    if (!inquiryData) {
      return NextResponse.json({ success: false, error: "Inquiry record not found." }, { status: 404 });
    }

    // 2. Prepare Formspree payload
    const isBooking = inquiryData.inquiryType === "celebrity_booking";
    const endpointLabel = isBooking
      ? "Celebrity Booking Request"
      : "General Contact & Enquiry";

    const payload: Record<string, string> = {
      _subject: isBooking
        ? `[Booking Inquiry - Retried] ${inquiryData.celebrityName || "Celebrity"} - ${inquiryData.customerName}`
        : `[Contact Inquiry - Retried] ${inquiryData.subject || "General"} - ${inquiryData.customerName}`,
      name: inquiryData.customerName,
      email: inquiryData.email,
      _replyto: inquiryData.email,
      phone: inquiryData.phone,
      message: inquiryData.message,
      inquiryType: endpointLabel,
      "Customer Name": inquiryData.customerName,
      "Email Address": inquiryData.email,
      "Phone Number": inquiryData.phone,
      "Inquiry Type": endpointLabel,
      "Source Page": inquiryData.sourcePage || "/",
      "Inquiry Reference ID": inquiryData.id,
      "Retry Date (IST)": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    if (isBooking) {
      payload["celebrityName"] = inquiryData.celebrityName || "N/A";
      payload["Celebrity Name"] = inquiryData.celebrityName || "N/A";
      if (inquiryData.celebrityId) {
        payload["celebrityId"] = inquiryData.celebrityId;
        payload["Celebrity ID"] = inquiryData.celebrityId;
      }
      payload["eventType"] = inquiryData.eventType || "N/A";
      payload["Event Type"] = inquiryData.eventType || "N/A";
      payload["eventDate"] = inquiryData.eventDate || "N/A";
      payload["Event Date"] = inquiryData.eventDate || "N/A";
      payload["eventLocation"] = inquiryData.eventLocation || "N/A";
      payload["Event Location / Venue"] = inquiryData.eventLocation || "N/A";
      if (inquiryData.budget || inquiryData.budgetRange) {
        const budgetVal = inquiryData.budget || inquiryData.budgetRange || "N/A";
        payload["budget"] = budgetVal;
        payload["Budget"] = budgetVal;
      }
      if (inquiryData.audienceCount) {
        payload["audienceCount"] = inquiryData.audienceCount;
        payload["Expected Audience"] = inquiryData.audienceCount;
      }
    } else {
      if (inquiryData.subject) {
        payload["subject"] = inquiryData.subject;
        payload["Subject"] = inquiryData.subject;
      }
    }

    // 3. Dispatch to Formspree
    const formspreeRes = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const nowIso = new Date().toISOString();

    if (formspreeRes.ok) {
      const updates = {
        formspreeStatus: "sent",
        formspreeSentAt: nowIso,
        formspreeError: null,
        updatedAt: nowIso,
      };

      if (adminDb) {
        await adminDb.collection("inquiries").doc(id).update(updates);
      } else if (db) {
        await updateDoc(doc(db, "inquiries", id), updates);
      }

      return NextResponse.json({
        success: true,
        message: "Successfully forwarded to Formspree.",
        formspreeStatus: "sent",
        sentAt: nowIso,
      });
    }

    let errorDetail = `HTTP ${formspreeRes.status}: ${formspreeRes.statusText}`;
    try {
      const text = await formspreeRes.text();
      if (text) {
        try {
          const errJson = JSON.parse(text);
          if (errJson && errJson.errors && Array.isArray(errJson.errors)) {
            errorDetail =
              errJson.errors
                .map((e: { message?: string }) => e.message || "")
                .filter(Boolean)
                .join("; ") || errorDetail;
          } else if (errJson && errJson.error) {
            errorDetail = typeof errJson.error === "string" ? errJson.error : errorDetail;
          }
        } catch {
          errorDetail = `${errorDetail} - ${text.slice(0, 150)}`;
        }
      }
    } catch {}

    const failedUpdates = {
      formspreeStatus: "failed",
      formspreeError: errorDetail,
      updatedAt: nowIso,
    };

    if (adminDb) {
      await adminDb.collection("inquiries").doc(id).update(failedUpdates);
    } else if (db) {
      await updateDoc(doc(db, "inquiries", id), failedUpdates);
    }

    return NextResponse.json({
      success: false,
      error: `Formspree rejected submission: ${errorDetail}`,
      formspreeStatus: "failed",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AdminInquiriesAPI] Error retrying Formspree for ${id}:`, err);
    return NextResponse.json(
      { success: false, error: `Failed to retry Formspree: ${msg}` },
      { status: 500 }
    );
  }
}

