export type InquiryType = "contact" | "celebrity_booking";
export type InquiryStatus = "new" | "in_progress" | "completed" | "rejected";
export type FormspreeStatus = "pending" | "sent" | "failed";

export interface Inquiry {
  id: string;
  inquiryType: InquiryType;
  customerName: string;
  fullName?: string; // backwards compatibility with existing firestore schema
  email: string;
  phone: string;
  message: string;
  sourcePage: string;
  status: InquiryStatus;
  adminNotes?: string;
  formspreeStatus: FormspreeStatus;
  formspreeEndpointType: "contact" | "celebrity_booking";
  formspreeError?: string;
  formspreeSentAt?: string;
  submittedAt: string;
  updatedAt: string;

  // Celebrity booking specific fields
  celebrityName?: string;
  celebrityId?: string;
  eventType?: string;
  eventDate?: string;
  eventLocation?: string;
  budget?: string;
  budgetRange?: string;
  audienceCount?: string;

  // Contact specific fields
  subject?: string;

  // Audit metadata
  ipAddress?: string;
  userAgent?: string;
}

export interface SubmitInquiryPayload {
  inquiryType: InquiryType;
  customerName: string;
  email: string;
  phone: string;
  message: string;
  sourcePage?: string;

  // Celebrity fields
  celebrityName?: string;
  celebrityId?: string;
  eventType?: string;
  eventDate?: string;
  eventLocation?: string;
  budget?: string;
  budgetRange?: string;
  audienceCount?: string;

  // Contact fields
  subject?: string;

  // Anti-spam honeypot (must be empty)
  _gotcha?: string;
}

export interface InquirySubmissionResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
  formspreeStatus?: FormspreeStatus;
  error?: string;
}

export interface InquiriesStats {
  total: number;
  newCount: number;
  inProgress: number;
  contactCount: number;
  bookingCount: number;
  completed: number;
  rejected: number;
}

