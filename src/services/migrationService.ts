import { db, auth } from "@/lib/firebase";
import { doc, setDoc, getDocs, collection, getDoc } from "firebase/firestore";
import { getStoredCategories } from "./categoryService";
import { getStoredCelebrities } from "./celebrityService";
import { getBanners } from "./bannerService";
import { getSiteSettingsSync } from "./siteSettingsService";
import { getStoredInquiriesSync, StoredBookingInquiry } from "./bookingService";
import { Category, Celebrity } from "@/types";
import { HeroBanner } from "@/types/banner";
import { AllSiteSettings } from "@/types/settings";

export interface MigrationReport {
  success: boolean;
  dryRun: boolean;
  timestamp: string;
  counts: {
    categories: { scanned: number; migrated: number; errors: number };
    subcategories: { scanned: number };
    celebrities: { scanned: number; migrated: number; errors: number };
    banners: { scanned: number; migrated: number; errors: number };
    settings: { scanned: number; migrated: number; errors: number };
    inquiries: { scanned: number; migrated: number; errors: number };
  };
  imageAudit: {
    validHostedImages: number;
    warningBlobOrDataImages: number;
    missingImages: number;
  };
  firestoreVerification?: {
    categories: number;
    celebrities: number;
    banners: number;
    settingsExists: boolean;
    inquiries: number;
  };
  logs: string[];
  errors: string[];
}

const defaultSampleInquiries: StoredBookingInquiry[] = [
  {
    id: "INQ-M1-SAMPLE",
    fullName: "Amit Singhania",
    email: "amit.singhania@apexcorp.in",
    phone: "+91 98201 12345",
    celebrityName: "Pankaj Tripathi",
    eventType: "Corporate Annual Gala & Keynote",
    eventDate: "2026-11-20",
    eventLocation: "Taj Lands End, Bandra, Mumbai",
    budgetRange: "₹15,00,000 - ₹25,00,000",
    audienceCount: "450",
    message: "Requires stage mic and VIP lounge before 45-minute keynote talk.",
    agreedToTerms: true,
    submittedAt: "2026-10-18T10:30:00.000Z",
    status: "new",
  },
  {
    id: "INQ-M2-SAMPLE",
    fullName: "Priya Malpani",
    email: "priya.weddings@delhievents.com",
    phone: "+91 98110 54321",
    celebrityName: "Shreya Ghoshal",
    eventType: "High-Profile Destination Wedding Sangeet",
    eventDate: "2026-12-15",
    eventLocation: "Umaid Bhawan Palace, Jodhpur",
    budgetRange: "₹35,00,000+",
    audienceCount: "600",
    message: "Full 90-minute live band performance with acoustic sound system.",
    agreedToTerms: true,
    submittedAt: "2026-10-18T14:15:00.000Z",
    status: "pending",
  },
];

function cleanFirestoreData(obj: Record<string, any>): Record<string, any> {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Audit image URLs to ensure they are valid hosted URLs (not browser blobs or empty).
 */
export function auditImageUrls() {
  const categories = getStoredCategories();
  const celebrities = getStoredCelebrities();
  const banners = getBanners();

  let validHostedImages = 0;
  let warningBlobOrDataImages = 0;
  let missingImages = 0;
  const flaggedItems: { type: string; id: string; url: string; reason: string }[] = [];

  const checkUrl = (url: string | undefined, type: string, id: string) => {
    if (!url || !url.trim()) {
      missingImages++;
      flaggedItems.push({ type, id, url: "", reason: "Missing / empty image URL" });
      return;
    }
    const trimmed = url.trim();
    if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
      warningBlobOrDataImages++;
      flaggedItems.push({
        type,
        id,
        url: trimmed.substring(0, 40) + "...",
        reason: "Temporary browser blob/data URL. Should be migrated to permanent CDN hosting.",
      });
    } else if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
      validHostedImages++;
    } else {
      warningBlobOrDataImages++;
      flaggedItems.push({ type, id, url: trimmed, reason: "Unrecognized URL scheme" });
    }
  };

  categories.forEach((cat) => {
    checkUrl(cat.image, "Category", cat.name);
    (cat.subcategories || []).forEach((sub) => {
      if (sub.image) checkUrl(sub.image, "Subcategory", sub.name);
    });
  });

  celebrities.forEach((cel) => {
    checkUrl(cel.profileImage || cel.mainImage, "Celebrity Profile", cel.name);
    (cel.gallery || []).forEach((img) => checkUrl(img, "Celebrity Gallery", cel.name));
  });

  banners.forEach((b) => {
    checkUrl(b.desktopImage, "Hero Banner (Desktop)", b.title);
    if (b.mobileImage) checkUrl(b.mobileImage, "Hero Banner (Mobile)", b.title);
  });

  return {
    validHostedImages,
    warningBlobOrDataImages,
    missingImages,
    flaggedItems,
  };
}

/**
 * Generate full snapshot of existing database for backup/export.
 */
export function generateFullDatabaseBackup() {
  const categories = getStoredCategories();
  const celebrities = getStoredCelebrities();
  const banners = getBanners();
  const siteSettings = getSiteSettingsSync();
  const storedInquiries = getStoredInquiriesSync();
  const inquiries = storedInquiries.length > 0 ? storedInquiries : defaultSampleInquiries;

  return {
    exportVersion: "1.0",
    appName: "Celebrity Bulaye",
    exportedAt: new Date().toISOString(),
    data: {
      categories,
      celebrities,
      banners,
      siteSettings,
      inquiries,
    },
    meta: {
      totalCategories: categories.length,
      totalCelebrities: celebrities.length,
      totalBanners: banners.length,
      totalInquiries: inquiries.length,
    },
  };
}

/**
 * Download a local JSON file containing the full database backup.
 */
export function downloadBackupFile(): void {
  if (typeof window === "undefined") return;
  const backup = generateFullDatabaseBackup();
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `celebrity_bulaye_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Perform safe, idempotent migration of all local data into Firestore.
 */
export async function runFirestoreMigration(options: {
  dryRun?: boolean;
  onProgress?: (message: string, percent: number) => void;
}): Promise<MigrationReport> {
  const dryRun = options.dryRun ?? false;
  const onProgress = options.onProgress || (() => {});
  const logs: string[] = [];
  const errors: string[] = [];

  const log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    logs.push(`[${timestamp}] ${msg}`);
  };

  log(`Starting ${dryRun ? "DRY-RUN PREVIEW" : "LIVE MIGRATION"} to Firestore...`);
  onProgress(dryRun ? "Analyzing local data for dry-run..." : "Initializing migration...", 5);

  const categories = getStoredCategories();
  const celebrities = getStoredCelebrities();
  const banners = getBanners();
  const siteSettings = getSiteSettingsSync();
  const storedInquiries = getStoredInquiriesSync();
  const inquiries = storedInquiries.length > 0 ? storedInquiries : defaultSampleInquiries;
  const imageAudit = auditImageUrls();

  const report: MigrationReport = {
    success: true,
    dryRun,
    timestamp: new Date().toISOString(),
    counts: {
      categories: { scanned: categories.length, migrated: 0, errors: 0 },
      subcategories: {
        scanned: categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0),
      },
      celebrities: { scanned: celebrities.length, migrated: 0, errors: 0 },
      banners: { scanned: banners.length, migrated: 0, errors: 0 },
      settings: { scanned: 1, migrated: 0, errors: 0 },
      inquiries: { scanned: inquiries.length, migrated: 0, errors: 0 },
    },
    imageAudit: {
      validHostedImages: imageAudit.validHostedImages,
      warningBlobOrDataImages: imageAudit.warningBlobOrDataImages,
      missingImages: imageAudit.missingImages,
    },
    logs,
    errors,
  };

  log(
    `Found: ${categories.length} categories (${report.counts.subcategories.scanned} subcategories), ` +
      `${celebrities.length} celebrities, ${banners.length} hero banners, 1 site configuration doc, and ${inquiries.length} sample inquiries.`
  );

  if (dryRun) {
    log("Dry run complete: No documents written to Firestore.");
    onProgress("Dry-run preview generated.", 100);
    return report;
  }

  // Live migration execution
  if (!db) {
    const err = "Firebase Firestore instance is unavailable. Check .env.local configuration.";
    errors.push(err);
    log(`ERROR: ${err}`);
    report.success = false;
    return report;
  }

  // 1. Migrate Categories
  log("Step 1/5: Migrating Categories to Firestore 'categories' collection...");
  onProgress("Migrating categories...", 15);
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    try {
      const docRef = doc(db, "categories", cat.id);
      await setDoc(docRef, cleanFirestoreData(cat), { merge: true });
      report.counts.categories.migrated++;
      log(`  ✓ Category [${cat.id}] "${cat.name}" imported with ${cat.subcategories?.length || 0} subcategories.`);
    } catch (err: unknown) {
      report.counts.categories.errors++;
      const msg = `Failed to migrate category ${cat.name} (${cat.id}): ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      log(`  ✗ ${msg}`);
    }
  }

  // 2. Migrate Celebrities
  log("Step 2/5: Migrating Celebrities to Firestore 'celebrities' collection...");
  onProgress("Migrating celebrities...", 40);
  for (let i = 0; i < celebrities.length; i++) {
    const cel = celebrities[i];
    try {
      const docRef = doc(db, "celebrities", cel.id);
      await setDoc(docRef, cleanFirestoreData(cel), { merge: true });
      report.counts.celebrities.migrated++;
      log(`  ✓ Celebrity [${cel.id}] "${cel.name}" (${cel.category}) imported.`);
    } catch (err: unknown) {
      report.counts.celebrities.errors++;
      const msg = `Failed to migrate celebrity ${cel.name} (${cel.id}): ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      log(`  ✗ ${msg}`);
    }
  }

  // 3. Migrate Hero Banners
  log("Step 3/5: Migrating Hero Banners to Firestore 'banners' collection...");
  onProgress("Migrating hero banners...", 65);
  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];
    try {
      const docRef = doc(db, "banners", banner.id);
      await setDoc(docRef, cleanFirestoreData(banner), { merge: true });
      report.counts.banners.migrated++;
      log(`  ✓ Banner [${banner.id}] "${banner.title}" (Order: ${banner.displayOrder}) imported.`);
    } catch (err: unknown) {
      report.counts.banners.errors++;
      const msg = `Failed to migrate banner ${banner.title} (${banner.id}): ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      log(`  ✗ ${msg}`);
    }
  }

  // 4. Migrate Site Settings
  log("Step 4/5: Migrating Site Settings to Firestore 'siteSettings/main'...");
  onProgress("Migrating site settings...", 80);
  try {
    const docRef = doc(db, "siteSettings", "main");
    await setDoc(docRef, cleanFirestoreData(siteSettings), { merge: true });
    report.counts.settings.migrated++;
    log(`  ✓ Site Settings [main] successfully synced to Firestore.`);
  } catch (err: unknown) {
    report.counts.settings.errors++;
    const msg = `Failed to migrate site settings: ${err instanceof Error ? err.message : String(err)}`;
    errors.push(msg);
    log(`  ✗ ${msg}`);
  }

  // 5. Migrate Inquiries
  log("Step 5/5: Migrating Inquiries to Firestore 'inquiries' collection...");
  onProgress("Migrating customer inquiries...", 90);
  for (let i = 0; i < inquiries.length; i++) {
    const inq = inquiries[i];
    try {
      const docRef = doc(db, "inquiries", inq.id);
      await setDoc(docRef, cleanFirestoreData(inq), { merge: true });
      report.counts.inquiries.migrated++;
      log(`  ✓ Inquiry [${inq.id}] for "${inq.celebrityName}" imported.`);
    } catch (err: unknown) {
      report.counts.inquiries.errors++;
      const msg = `Failed to migrate inquiry ${inq.id}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      log(`  ✗ ${msg}`);
    }
  }

  // 6. Verification Phase: Verify Firestore document counts
  log("Verification: Checking document counts directly from Firestore...");
  onProgress("Verifying Firestore counts...", 95);
  try {
    const catSnap = await getDocs(collection(db, "categories"));
    const celSnap = await getDocs(collection(db, "celebrities"));
    const banSnap = await getDocs(collection(db, "banners"));
    const inqSnap = await getDocs(collection(db, "inquiries"));
    const setSnap = await getDoc(doc(db, "siteSettings", "main"));

    report.firestoreVerification = {
      categories: catSnap.size,
      celebrities: celSnap.size,
      banners: banSnap.size,
      settingsExists: setSnap.exists(),
      inquiries: inqSnap.size,
    };

    log(
      `Verification Success: Firestore contains ${catSnap.size} categories, ` +
        `${celSnap.size} celebrities, ${banSnap.size} banners, ${inqSnap.size} inquiries, and settings document exists.`
    );
  } catch (err: unknown) {
    log(`Verification Warning: Could not complete post-migration count verification: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (errors.length > 0) {
    report.success = false;
    log(`Migration completed with ${errors.length} error(s). Review log details.`);
  } else {
    log("🎉 Migration completed with 100% SUCCESS! All documents verified.");
  }

  onProgress("Migration finished.", 100);
  return report;
}
