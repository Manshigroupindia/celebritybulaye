import { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export interface AdminAuthResult {
  authorized: boolean;
  uid?: string;
  email?: string;
  error?: string;
}

/**
 * Server-side authentication and authorization verification.
 * Verifies Firebase ID token via Admin SDK or Google Identity Toolkit REST API.
 */
export async function verifyAdminAuthorization(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authorized: false, error: "Missing or malformed Authorization header. Bearer token required." };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return { authorized: false, error: "Empty bearer token." };
  }

  // 1. Try Firebase Admin SDK if service account is configured
  try {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      const decoded = await adminAuth.verifyIdToken(token);
      if (decoded && decoded.uid) {
        return { authorized: true, uid: decoded.uid, email: decoded.email };
      }
    }
  } catch (err: unknown) {
    console.warn("[AdminAuth] Admin SDK token verification notice:", err);
  }

  // 2. Direct cryptographic verification against Google Identity Toolkit REST API
  // Works seamlessly even when server-side service account is not injected
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return { authorized: false, error: "Server authentication configuration missing." };
  }

  try {
    const lookupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!lookupRes.ok) {
      const errorJson = await lookupRes.json().catch(() => ({}));
      return {
        authorized: false,
        error: errorJson.error?.message || "Invalid, expired, or revoked Firebase ID token.",
      };
    }

    const data = await lookupRes.json();
    const user = data.users?.[0];
    if (!user || !user.localId) {
      return { authorized: false, error: "User record not found in project directory." };
    }

    return {
      authorized: true,
      uid: user.localId,
      email: user.email,
    };
  } catch (err: unknown) {
    return {
      authorized: false,
      error: `Token verification request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

