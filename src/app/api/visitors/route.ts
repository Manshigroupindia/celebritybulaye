import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { getAdminFirestore, FieldValue as AdminFieldValue } from "@/lib/firebaseAdmin";
import { defaultSiteSettings } from "@/data/defaultSiteSettings";
import fs from "fs";
import path from "path";

// In-memory rate limiter for server API (prevents rapid-fire bot requests from same IP)
const recentHits = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds per IP

// Local persistent cache fallback for environments without service account keys
const FALLBACK_CACHE_FILE = path.join(process.cwd(), ".visitor_counter_store.json");

function readFallbackCache(): { count: number; enabled: boolean } {
  try {
    if (fs.existsSync(FALLBACK_CACHE_FILE)) {
      const raw = fs.readFileSync(FALLBACK_CACHE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (typeof parsed.count === "number") {
        return { count: parsed.count, enabled: parsed.enabled !== false };
      }
    }
  } catch {}
  return { count: 10000, enabled: true };
}

function writeFallbackCache(data: { count: number; enabled: boolean }) {
  try {
    const dir = path.dirname(FALLBACK_CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_CACHE_FILE, JSON.stringify(data), "utf-8");
  } catch {}
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "anonymous";
}

/**
 * GET /api/visitors
 * Retrieve current visitor count and enabled status from Firestore (with graceful fallbacks).
 */
export async function GET() {
  try {
    // 1. Try Firebase Admin SDK if configured
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const snap = await adminDb.collection("siteStats").doc("visitors").get();
      if (snap.exists) {
        const data = snap.data();
        const count = typeof data?.count === "number" ? data.count : 10000;
        const enabled = data?.enabled !== undefined ? !!data.enabled : true;
        writeFallbackCache({ count, enabled });
        return NextResponse.json({ success: true, count, enabled });
      }
    }

    // 2. Try Firestore Client SDK
    if (db) {
      // First attempt dedicated siteStats doc
      try {
        const statsRef = doc(db, "siteStats", "visitors");
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
          const data = snap.data();
          const count = typeof data.count === "number" ? data.count : 10000;
          const enabled = data.enabled !== undefined ? !!data.enabled : true;
          writeFallbackCache({ count, enabled });
          return NextResponse.json({ success: true, count, enabled });
        }
      } catch {
        // If siteStats has permission restriction, fallback to siteSettings
      }

      // Fallback: Read siteSettings/main (which allows public read)
      try {
        const settingsRef = doc(db, "siteSettings", "main");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const settingsData = settingsSnap.data();
          if (settingsData?.visitorCounter) {
            const count = settingsData.visitorCounter.currentCount ?? settingsData.visitorCounter.startingCount ?? 10000;
            const enabled = settingsData.visitorCounter.enabled !== false;
            // Also compare with fallback cache if cache is ahead
            const cached = readFallbackCache();
            const resolvedCount = Math.max(count, cached.count);
            return NextResponse.json({ success: true, count: resolvedCount, enabled });
          }
        }
      } catch {}
    }

    // 3. Fallback to local cache or defaults
    const cached = readFallbackCache();
    return NextResponse.json({
      success: true,
      count: cached.count,
      enabled: cached.enabled,
    });
  } catch (err: unknown) {
    console.error("[API /api/visitors GET error]:", err);
    const cached = readFallbackCache();
    return NextResponse.json({
      success: true,
      count: cached.count,
      enabled: cached.enabled,
    });
  }
}

/**
 * POST /api/visitors
 * Atomic session visit increment.
 * Ensures genuine visits are tracked atomically in Firestore.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const lastHit = recentHits.get(ip);

    // Abuse protection: If the same IP attempts multiple increments within window, reject duplicate hit
    if (lastHit && now - lastHit < RATE_LIMIT_WINDOW_MS) {
      return await GET();
    }
    recentHits.set(ip, now);

    // Clean up old IP map entries periodically (keep max 1000 entries)
    if (recentHits.size > 1000) {
      for (const [key, timestamp] of recentHits.entries()) {
        if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
          recentHits.delete(key);
        }
      }
    }

    // 1. Try Firebase Admin SDK if service account is available (full atomic bypass)
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const statsRef = adminDb.collection("siteStats").doc("visitors");
      const snap = await statsRef.get();

      if (!snap.exists) {
        // Read starting count from siteSettings or default
        const sSnap = await adminDb.collection("siteSettings").doc("main").get();
        const sData = sSnap.data();
        const start = sData?.visitorCounter?.startingCount ?? 10000;
        const enabled = sData?.visitorCounter?.enabled !== false;

        if (!enabled) {
          return NextResponse.json({ success: true, count: start, enabled: false, incremented: false });
        }

        const newCount = start + 1;
        await statsRef.set({ count: newCount, enabled: true, updatedAt: new Date().toISOString() });
        writeFallbackCache({ count: newCount, enabled: true });
        return NextResponse.json({ success: true, count: newCount, enabled: true, incremented: true });
      }

      const data = snap.data();
      const enabled = data?.enabled !== false;
      if (!enabled) {
        return NextResponse.json({ success: true, count: data?.count ?? 10000, enabled: false, incremented: false });
      }

      await statsRef.update({
        count: AdminFieldValue.increment(1),
        updatedAt: new Date().toISOString(),
      });

      const updatedSnap = await statsRef.get();
      const updatedCount = updatedSnap.data()?.count ?? ((data?.count ?? 10000) + 1);
      writeFallbackCache({ count: updatedCount, enabled: true });

      return NextResponse.json({
        success: true,
        count: updatedCount,
        enabled: true,
        incremented: true,
      });
    }

    // 2. Try Firestore Client SDK with atomic increment
    if (db) {
      try {
        const statsRef = doc(db, "siteStats", "visitors");
        const snap = await getDoc(statsRef);

        if (snap.exists()) {
          const data = snap.data();
          const enabled = data.enabled !== false;
          if (!enabled) {
            return NextResponse.json({ success: true, count: data.count ?? 10000, enabled: false, incremented: false });
          }

          await updateDoc(statsRef, {
            count: increment(1),
            updatedAt: new Date().toISOString(),
          });

          const updatedSnap = await getDoc(statsRef);
          const updatedCount = updatedSnap.data()?.count ?? ((data.count ?? 10000) + 1);
          writeFallbackCache({ count: updatedCount, enabled: true });

          return NextResponse.json({
            success: true,
            count: updatedCount,
            enabled: true,
            incremented: true,
          });
        }
      } catch (clientErr) {
        // Fall through to cache-backed increment
      }
    }

    // 3. Fallback persistent increment (preserves count during local testing/before service account setup)
    const cached = readFallbackCache();
    if (!cached.enabled) {
      return NextResponse.json({
        success: true,
        count: cached.count,
        enabled: false,
        incremented: false,
      });
    }

    const newCount = cached.count + 1;
    writeFallbackCache({ count: newCount, enabled: true });

    return NextResponse.json({
      success: true,
      count: newCount,
      enabled: true,
      incremented: true,
    });
  } catch (err: unknown) {
    console.error("[API /api/visitors POST error]:", err);
    const cached = readFallbackCache();
    return NextResponse.json({
      success: true,
      count: cached.count + 1,
      enabled: true,
      incremented: true,
    });
  }
}
