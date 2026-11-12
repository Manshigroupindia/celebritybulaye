import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuthorization } from "@/lib/adminAuth";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { InquiryStatus } from "@/types/inquiry";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/admin/inquiries/[id]
 * Updates status and/or adminNotes for an inquiry.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
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
    const body = await req.json();
    const allowedStatuses: InquiryStatus[] = ["new", "in_progress", "completed", "rejected"];

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.status && allowedStatuses.includes(body.status)) {
      updates.status = body.status;
    }

    if (body.adminNotes !== undefined && typeof body.adminNotes === "string") {
      updates.adminNotes = body.adminNotes.trim();
    }

    // 1. Try Firebase Admin SDK
    const adminDb = getAdminFirestore();
    if (adminDb) {
      await adminDb.collection("inquiries").doc(id).update(updates);
      return NextResponse.json({
        success: true,
        message: "Inquiry updated successfully.",
        updates,
      });
    }

    // 2. Client SDK Fallback
    if (db) {
      const docRef = doc(db, "inquiries", id);
      await updateDoc(docRef, updates);
      return NextResponse.json({
        success: true,
        message: "Inquiry updated successfully.",
        updates,
      });
    }

    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AdminInquiriesAPI] Error updating inquiry ${id}:`, err);
    return NextResponse.json(
      { success: false, error: `Failed to update inquiry: ${msg}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/inquiries/[id]
 * Deletes an inquiry record from Firestore.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
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
    // 1. Try Firebase Admin SDK
    const adminDb = getAdminFirestore();
    if (adminDb) {
      await adminDb.collection("inquiries").doc(id).delete();
      return NextResponse.json({
        success: true,
        message: `Inquiry ${id} deleted successfully.`,
      });
    }

    // 2. Client SDK Fallback
    if (db) {
      const docRef = doc(db, "inquiries", id);
      await deleteDoc(docRef);
      return NextResponse.json({
        success: true,
        message: `Inquiry ${id} deleted successfully.`,
      });
    }

    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AdminInquiriesAPI] Error deleting inquiry ${id}:`, err);
    return NextResponse.json(
      { success: false, error: `Failed to delete inquiry: ${msg}` },
      { status: 500 }
    );
  }
}

