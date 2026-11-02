import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminAuth } from "@/lib/firebaseAdmin";

/**
 * Server-side authentication and authorization verification.
 * Verifies Firebase ID token via Admin SDK or Google Identity Toolkit.
 */
async function verifyAdminAuthorization(req: NextRequest): Promise<{
  authorized: boolean;
  uid?: string;
  email?: string;
  error?: string;
}> {
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
    console.warn("[AdminAuth] Admin SDK token verification error:", err);
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

export async function GET(req: NextRequest) {
  try {
    // Perform server-side authentication and authorization check
    const authResult = await verifyAdminAuthorization(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Administrator authentication required.",
          details: authResult.error,
        },
        { status: 401 }
      );
    }

    const jsonPath = path.resolve(process.cwd(), "celebritybulaye-migration.json");
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { success: false, error: "celebritybulaye-migration.json not found in root directory." },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        authenticatedUser: authResult.email,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Failed to load migration JSON:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load migration JSON file.",
      },
      { status: 500 }
    );
  }
}
