import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuthorization } from "@/lib/adminAuth";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Inquiry } from "@/types/inquiry";

/**
 * GET /api/admin/inquiries
 * Retrieves all stored inquiries from Firestore.
 * Strictly requires verified Admin Authorization header.
 */
export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminAuthorization(req);
  if (!authCheck.authorized) {
    return NextResponse.json(
      { success: false, error: authCheck.error || "Unauthorized admin access." },
      { status: 401 }
    );
  }

  try {
    const list: Inquiry[] = [];

    // 1. Try Firebase Admin SDK
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const snap = await adminDb
        .collection("inquiries")
        .orderBy("submittedAt", "desc")
        .get();

      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Inquiry);
      });

      return NextResponse.json({
        success: true,
        count: list.length,
        inquiries: list,
      });
    }

    // 2. Client SDK Fallback
    if (db) {
      const q = query(collection(db, "inquiries"), orderBy("submittedAt", "desc"));
      const snap = await getDocs(q);

      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Inquiry);
      });

      return NextResponse.json({
        success: true,
        count: list.length,
        inquiries: list,
      });
    }

    return NextResponse.json({
      success: true,
      count: 0,
      inquiries: [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[AdminInquiriesAPI] Error fetching inquiries:", err);
    return NextResponse.json(
      { success: false, error: `Failed to fetch inquiries: ${msg}` },
      { status: 500 }
    );
  }
}

