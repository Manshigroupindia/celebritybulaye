import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Inquiry, InquiryType, FormspreeStatus } from "@/types/inquiry";

// Single universal Formspree endpoint for EVERY form across the entire website
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mwlokrov";

// In-memory IP rate limiter: max 6 requests per 60 seconds per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "anonymous";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

function sanitizeText(str: unknown, maxLen = 1000): string {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLen);
}

/**
 * Forward inquiry payload to the single universal Formspree endpoint (mwlokrov).
 */
async function forwardToFormspree(inquiry: Inquiry): Promise<{
  success: boolean;
  error?: string;
}> {
  const isBooking = inquiry.inquiryType === "celebrity_booking";
  const endpointLabel = isBooking
    ? "Celebrity Booking Request"
    : "General Contact & Enquiry";

  // Build clean, Formspree-compatible form submission data.
  // Standard Formspree fields: name, email, _replyto, phone, message, _subject
  const payload: Record<string, string> = {
    _subject: isBooking
      ? `[Booking Inquiry] ${inquiry.celebrityName || "Celebrity"} - ${inquiry.customerName}`
      : `[Contact Inquiry] ${inquiry.subject || "General"} - ${inquiry.customerName}`,
    name: inquiry.customerName,
    email: inquiry.email,
    _replyto: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    inquiryType: endpointLabel,
    "Customer Name": inquiry.customerName,
    "Email Address": inquiry.email,
    "Phone Number": inquiry.phone,
    "Inquiry Type": endpointLabel,
    "Source Page": inquiry.sourcePage || "/",
    "Inquiry Reference ID": inquiry.id,
    "Submission Date (IST)": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  };

  if (isBooking) {
    payload["celebrityName"] = inquiry.celebrityName || "N/A";
    payload["Celebrity Name"] = inquiry.celebrityName || "N/A";
    if (inquiry.celebrityId) {
      payload["celebrityId"] = inquiry.celebrityId;
      payload["Celebrity ID"] = inquiry.celebrityId;
    }
    payload["eventType"] = inquiry.eventType || "N/A";
    payload["Event Type"] = inquiry.eventType || "N/A";
    payload["eventDate"] = inquiry.eventDate || "N/A";
    payload["Event Date"] = inquiry.eventDate || "N/A";
    payload["eventLocation"] = inquiry.eventLocation || "N/A";
    payload["Event Location / Venue"] = inquiry.eventLocation || "N/A";
    if (inquiry.budget || inquiry.budgetRange) {
      const budgetVal = inquiry.budget || inquiry.budgetRange || "N/A";
      payload["budget"] = budgetVal;
      payload["Budget"] = budgetVal;
    }
    if (inquiry.audienceCount) {
      payload["audienceCount"] = inquiry.audienceCount;
      payload["Expected Audience"] = inquiry.audienceCount;
    }
  } else {
    if (inquiry.subject) {
      payload["subject"] = inquiry.subject;
      payload["Subject"] = inquiry.subject;
    }
  }

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true };
    }

    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          if (json && Array.isArray(json.errors) && json.errors.length > 0) {
            errorDetail =
              json.errors
                .map((e: { message?: string }) => e.message || "")
                .filter(Boolean)
                .join("; ") || errorDetail;
          } else if (json && json.error) {
            errorDetail = typeof json.error === "string" ? json.error : errorDetail;
          }
        } catch {
          errorDetail = `${errorDetail} - ${text.slice(0, 150)}`;
        }
      }
    } catch {}

    return { success: false, error: errorDetail };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Persist inquiry record in Firestore (tries Firebase Admin first, falls back to Client SDK).
 */
async function saveInquiryToFirestore(inquiry: Inquiry): Promise<void> {
  const adminDb = getAdminFirestore();

  if (adminDb) {
    await adminDb.collection("inquiries").doc(inquiry.id).set(JSON.parse(JSON.stringify(inquiry)));
    return;
  }

  if (db) {
    const docRef = doc(db, "inquiries", inquiry.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(inquiry)));
    return;
  }

  throw new Error("Firestore instance not available on server.");
}

/**
 * Update Formspree status for an inquiry record in Firestore.
 */
async function updateInquiryFormspreeStatus(
  id: string,
  status: FormspreeStatus,
  error?: string
): Promise<void> {
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    formspreeStatus: status,
    updatedAt: now,
  };

  if (status === "sent") {
    updates.formspreeSentAt = now;
    updates.formspreeError = null;
  } else if (status === "failed" && error) {
    updates.formspreeError = error;
  }

  const adminDb = getAdminFirestore();
  if (adminDb) {
    try {
      await adminDb.collection("inquiries").doc(id).update(updates);
      return;
    } catch (e) {
      console.warn("[InquiryAPI] Failed to update Formspree status via admin SDK:", e);
    }
  }

  if (db) {
    try {
      const docRef = doc(db, "inquiries", id);
      await updateDoc(docRef, updates);
    } catch (e) {
      console.warn("[InquiryAPI] Failed to update Formspree status via client SDK:", e);
    }
  }
}

/**
 * POST /api/inquiries
 * Public submission endpoint for all Contact Us and Celebrity Booking forms.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Rate Limiting Check
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many inquiries sent. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // 2. Anti-Spam Honeypot Check
    // If bot fills in the hidden `_gotcha` field, silently return success without processing
    if (body._gotcha && String(body._gotcha).trim() !== "") {
      return NextResponse.json({
        success: true,
        message: "Your inquiry has been received successfully.",
      });
    }

    // 3. Extract & Validate Fields
    const inquiryType: InquiryType =
      body.inquiryType === "contact" ? "contact" : "celebrity_booking";

    const customerName = sanitizeText(body.customerName || body.fullName || body.name, 100);
    const email = sanitizeText(body.email, 150).toLowerCase();
    const phone = sanitizeText(body.phone, 30);
    const message = sanitizeText(body.message, 3000);
    const sourcePage = sanitizeText(body.sourcePage || req.headers.get("referer") || "/", 200);

    // Validation rules
    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (!phone || digitsOnly.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number (at least 10 digits)." },
        { status: 400 }
      );
    }

    if (!message || message.length < 3) {
      return NextResponse.json(
        { success: false, error: "Please enter your message or event details." },
        { status: 400 }
      );
    }

    // Celebrity Booking Specific Validations
    let celebrityName: string | undefined;
    let celebrityId: string | undefined;
    let eventType: string | undefined;
    let eventDate: string | undefined;
    let eventLocation: string | undefined;
    let budget: string | undefined;
    let audienceCount: string | undefined;
    let subject: string | undefined;

    if (inquiryType === "celebrity_booking") {
      celebrityName = sanitizeText(body.celebrityName, 120);
      celebrityId = sanitizeText(body.celebrityId, 80);
      eventType = sanitizeText(body.eventType, 80);
      eventDate = sanitizeText(body.eventDate, 60);
      eventLocation = sanitizeText(body.eventLocation, 120);
      budget = sanitizeText(body.budget || body.budgetRange, 80);
      audienceCount = sanitizeText(body.audienceCount, 80);

      if (!celebrityName) {
        return NextResponse.json(
          { success: false, error: "Celebrity name is required for booking inquiries." },
          { status: 400 }
        );
      }
      if (!eventType) {
        return NextResponse.json(
          { success: false, error: "Please select an event type." },
          { status: 400 }
        );
      }
      if (!eventDate) {
        return NextResponse.json(
          { success: false, error: "Please specify an event date." },
          { status: 400 }
        );
      }
      if (!eventLocation) {
        return NextResponse.json(
          { success: false, error: "Event location/city is required." },
          { status: 400 }
        );
      }
    } else {
      subject = sanitizeText(body.subject, 150) || "General Booking Inquiry";
    }

    // 4. Generate Unique Inquiry Reference ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const generatedId = `INQ-${datePrefix}-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    // 5. Construct Document
    const inquiryRecord: Inquiry = {
      id: generatedId,
      inquiryType,
      customerName,
      fullName: customerName, // Backwards compatibility with existing firestore schema
      email,
      phone,
      message,
      sourcePage,
      status: "new",
      adminNotes: "",
      formspreeStatus: "pending",
      formspreeEndpointType: inquiryType,
      submittedAt: nowIso,
      updatedAt: nowIso,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || "",
      ...(celebrityName && { celebrityName }),
      ...(celebrityId && { celebrityId }),
      ...(eventType && { eventType }),
      ...(eventDate && { eventDate }),
      ...(eventLocation && { eventLocation }),
      ...(budget && { budget, budgetRange: budget }),
      ...(audienceCount && { audienceCount }),
      ...(subject && { subject }),
    };

    // 6. Forward to Formspree Endpoint
    const formspreeResult = await forwardToFormspree(inquiryRecord);
    inquiryRecord.formspreeStatus = formspreeResult.success ? "sent" : "failed";
    if (formspreeResult.success) {
      inquiryRecord.formspreeSentAt = new Date().toISOString();
    } else {
      inquiryRecord.formspreeError = formspreeResult.error;
      console.warn(
        `[InquiryAPI] Formspree forwarding failed for ${generatedId}:`,
        formspreeResult.error
      );
    }

    // 7. Persist to Firestore with single atomic create operation
    try {
      await saveInquiryToFirestore(inquiryRecord);
    } catch (dbErr) {
      console.warn("[InquiryAPI] Notice saving inquiry to Firestore:", dbErr);
    }

    // 8. Return tailored success message
    const successMessage =
      inquiryType === "celebrity_booking"
        ? "Your booking inquiry has been received successfully. Our team will contact you shortly."
        : "Thank you for contacting Celebrity Bulaye! Your inquiry has been submitted successfully. Our team will get in touch with you soon.";

    return NextResponse.json({
      success: true,
      inquiryId: generatedId,
      formspreeStatus: formspreeResult.success ? "sent" : "failed",
      message: successMessage,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[InquiryAPI] Internal error processing inquiry:", err);
    return NextResponse.json(
      { success: false, error: `Failed to process inquiry: ${errorMsg}` },
      { status: 500 }
    );
  }
}

