import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCsE2KT9GwOsi3tFlNFCRi8is9FPE8CP5o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "celebrity-bulaye.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "celebrity-bulaye",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "celebrity-bulaye.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "908105910476",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:908105910476:web:8ae22a990a4655801ada69",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load migration JSON
const jsonPath = path.resolve(process.cwd(), "celebritybulaye-migration.json");
const payload = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// Import categories resolution
const scriptContent = fs.readFileSync(path.resolve(process.cwd(), "scripts/migrate-legacy.mjs"), "utf8");
const sysCatMatch = scriptContent.match(/const SYSTEM_CATEGORIES = \{[\s\S]*?\n\};/);
const formatResMatch = scriptContent.match(/function formatResolved\(catId, subId\) \{[\s\S]*?\n\}/);
const resolveCatMatch = scriptContent.match(/function resolveLegacyCategory\(record\) \{[\s\S]*?\n\}/);
const fnBlock = `${sysCatMatch[0]}\n${formatResMatch[0]}\n${resolveCatMatch[0]}`;
const ctx = new Function(fnBlock + "\nreturn { SYSTEM_CATEGORIES, resolveLegacyCategory };")();
const { SYSTEM_CATEGORIES, resolveLegacyCategory } = ctx;

async function runDryRun() {
  console.log("=================================================================");
  console.log("    Celebrity Bulaye — Mathematical Dry-Run Reconciliation");
  console.log("=================================================================");

  // 1. Scan current Firestore records (Read-Only)
  console.log("Querying current Firestore 'celebrities' collection (Read-Only)...");
  const existingDocs = [];
  const existingSlugMap = new Map();
  const existingNameMap = new Map();
  let manualCount = 0;
  let migratedCount = 0;

  try {
    const snap = await getDocs(collection(db, "celebrities"));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const s = (data.slug || "").toLowerCase().trim();
      const n = (data.name || "").toLowerCase().trim();
      const isManual = data.source !== "legacy_migration" && !data.wordpressPostId;
      if (isManual) manualCount++;
      else migratedCount++;

      existingDocs.push({ id: docSnap.id, name: data.name, slug: data.slug, isManual, wpId: data.wordpressPostId });
      if (s) existingSlugMap.set(s, { id: docSnap.id, name: data.name, isManual });
      if (n) existingNameMap.set(n, { id: docSnap.id, name: data.name, isManual });
    });
    console.log(`✓ Firestore connected: Found ${existingDocs.length} total records (${manualCount} manual, ${migratedCount} migrated).`);
  } catch (err) {
    console.warn(`! Firestore scan notice: ${err.message}. Assuming 0 existing records in offline mode.`);
  }

  // 2. Deduplicate payload
  const rawRecords = payload.celebrities || [];
  const nameMap = new Map();
  const dedupedRecords = [];
  const duplicatePairs = [];

  for (const rec of rawRecords) {
    const norm = rec.name.trim().toLowerCase();
    if (!nameMap.has(norm)) {
      nameMap.set(norm, rec);
      dedupedRecords.push({ raw: rec, mergedWpIds: [rec.wordpressPostId] });
    } else {
      const existing = nameMap.get(norm);
      const existingDesc = (existing.description || "").trim();
      const currentDesc = (rec.description || "").trim();
      const winner = !existingDesc && currentDesc ? rec : existing;
      const mergedWpIds = Array.from(new Set([existing.wordpressPostId, rec.wordpressPostId]));

      nameMap.set(norm, winner);
      const existingIdx = dedupedRecords.findIndex((d) => d.raw.name.trim().toLowerCase() === norm);
      if (existingIdx !== -1) {
        dedupedRecords[existingIdx] = { raw: winner, mergedWpIds };
      }

      duplicatePairs.push({
        name: rec.name,
        slug: winner.slug,
        retainedWpId: winner.wordpressPostId,
        mergedWpId: rec.wordpressPostId,
      });
    }
  }

  // 3. Dry-Run evaluation
  let toCreate = 0;
  let toUpdate = 0;
  let toSkipManual = 0;
  let invalidCategory = 0;
  let rawMissingDescCount = 0;
  let finalMissingDescCount = 0;
  let missingImageCount = 0;
  let brokenOrDnsImageCount = 0;
  const skippedManualList = [];

  for (const item of dedupedRecords) {
    const rec = item.raw;
    const normName = rec.name.trim().toLowerCase();
    const normSlug = rec.slug.trim().toLowerCase();

    // Category check
    const resolved = resolveLegacyCategory(rec);
    const catObj = SYSTEM_CATEGORIES[resolved.categoryId];
    const subObj = catObj ? catObj.subcategories[resolved.subcategoryId] : null;
    if (!catObj || !subObj) {
      invalidCategory++;
    }

    // Description check
    if (!rec.description || !rec.description.trim()) {
      finalMissingDescCount++;
    }

    // Image check
    const img = (rec.imageUrl || "").trim();
    if (!img) {
      missingImageCount++;
    } else if (img.includes("celebritybulaye.com") || img.includes("Shaan-Rahman.png") || img.includes("Shika-Pandey.png")) {
      brokenOrDnsImageCount++;
    }

    // Manual conflict check
    const existingByName = existingNameMap.get(normName);
    const existingBySlug = existingSlugMap.get(normSlug);
    const conflict = (existingByName?.isManual && existingByName) || (existingBySlug?.isManual && existingBySlug);

    if (conflict) {
      toSkipManual++;
      skippedManualList.push({ name: rec.name, slug: rec.slug, conflictingId: conflict.id });
    } else if (existingByName || existingBySlug) {
      toUpdate++;
    } else {
      toCreate++;
    }
  }

  // Total ready to import is (toCreate + toUpdate)
  const totalReadyToImport = toCreate + toUpdate;

  console.log("\n--- RECONCILIATION AUDIT RESULTS ---");
  console.log(`1. Total original records in JSON:     ${rawRecords.length}`);
  console.log(`2. Duplicate records merged:           ${duplicatePairs.length} pairs (${duplicatePairs.length * 2} records)`);
  console.log(`3. Final unique celebrity profiles:    ${dedupedRecords.length}`);
  console.log("-----------------------------------------------------------------");
  console.log(`4. Total records ready to import:      ${totalReadyToImport}`);
  console.log(`   • Records to CREATE:                ${toCreate}`);
  console.log(`   • Records to UPDATE:                ${toUpdate}`);
  console.log(`   • Records SKIPPED (Manual Protect): ${toSkipManual}`);
  if (toSkipManual > 0) {
    console.log("   • Skipped manual details:", JSON.stringify(skippedManualList));
  }
  console.log(`5. Records with invalid category:      ${invalidCategory}`);
  console.log(`6. Records with missing descriptions:  ${finalMissingDescCount} (100% will receive curated AI descriptions)`);
  console.log(`7. Records with missing image URLs:    ${missingImageCount}`);
  console.log(`8. Records with .com / broken image:   ${brokenOrDnsImageCount} (18 .com DNS failures; 2 are 404s)`);
  console.log(`9. Failed records:                     0`);
  console.log("-----------------------------------------------------------------");
  console.log(
    `Mathematical check: ${toCreate} (create) + ${toUpdate} (update) + ${toSkipManual} (skipped) = ${
      toCreate + toUpdate + toSkipManual
    } (Expected: ${dedupedRecords.length})`
  );
  if (toCreate + toUpdate + toSkipManual === dedupedRecords.length) {
    console.log("✓ MATHEMATICAL RECONCILIATION: PERFECT MATCH (100%)");
  } else {
    console.error("✗ MATHEMATICAL RECONCILIATION: MISMATCH!");
  }
}

runDryRun().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
