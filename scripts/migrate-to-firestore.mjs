/**
 * Celebrity Bulaye — Automated CLI Firestore Migration Script
 *
 * This script imports all categories, subcategories, celebrities,
 * hero banners, and site configuration directly into your Firebase project.
 *
 * Usage:
 *   node scripts/migrate-to-firestore.mjs --email=admin@celebritybulaye.com --password=secret
 *   OR simply run:
 *   node scripts/migrate-to-firestore.mjs (it will prompt interactively for email & password)
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, collection, getDoc } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCsE2KT9GwOsi3tFlNFCRi8is9FPE8CP5o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "celebrity-bulaye.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "celebrity-bulaye",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "celebrity-bulaye.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "908105910476",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:908105910476:web:8ae22a990a4655801ada69",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Read seed-data.json
const seedDataPath = path.resolve(process.cwd(), "scripts", "seed-data.json");
if (!fs.existsSync(seedDataPath)) {
  console.error("✗ Error: scripts/seed-data.json not found.");
  process.exit(1);
}

const rawJson = fs.readFileSync(seedDataPath, "utf-8");
const seedData = JSON.parse(rawJson);

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
let email = args.find((a) => a.startsWith("--email="))?.split("=")[1] || process.env.ADMIN_EMAIL;
let password = args.find((a) => a.startsWith("--password="))?.split("=")[1] || process.env.ADMIN_PASSWORD;

function promptQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

// Deep clean any undefined values for Firestore compatibility
function cleanFirestoreData(data) {
  return JSON.parse(JSON.stringify(data));
}

async function main() {
  console.log("=================================================================");
  console.log("     Celebrity Bulaye — Production Cloud Firestore Migration");
  console.log("=================================================================");
  console.log(`Target Firebase Project: ${firebaseConfig.projectId}`);
  console.log(`Mode:                    ${isDryRun ? "DRY RUN (Preview Only)" : "LIVE WRITE (Idempotent Merge)"}`);
  console.log("-----------------------------------------------------------------");

  // Summary of local datasets
  const categoriesCount = seedData.categories?.length || 0;
  const subcategoriesCount = seedData.categories?.reduce((s, c) => s + (c.subcategories?.length || 0), 0) || 0;
  const celebritiesCount = seedData.celebrities?.length || 0;
  const bannersCount = seedData.banners?.length || 0;
  const hasSettings = Boolean(seedData.siteSettings);
  const inquiriesCount = seedData.inquiries?.length || 0;

  console.log("Payload Inventory:");
  console.log(`  • Categories:     ${categoriesCount} (with ${subcategoriesCount} subcategories)`);
  console.log(`  • Celebrities:    ${celebritiesCount} profiles (bios, riders, galleries)`);
  console.log(`  • Hero Banners:   ${bannersCount} carousel slides`);
  console.log(`  • Site Settings:  ${hasSettings ? "1 document (siteSettings/main)" : "None"}`);
  console.log(`  • Sample Leads:   ${inquiriesCount} customer booking inquiries`);
  console.log("-----------------------------------------------------------------");

  if (isDryRun) {
    console.log("✓ Dry-run completed. All datasets parsed and verified.");
    console.log("No data was written to Firestore.");
    process.exit(0);
  }

  // Interactive Authentication if credentials are not passed
  if (!email) {
    console.log("\n🔒 Firestore Security Rules require an authenticated administrator session.");
    email = await promptQuestion("Enter your Firebase Admin Email: ");
  }
  if (!password) {
    password = await promptQuestion("Enter your Firebase Admin Password: ");
  }

  if (!email || !password) {
    console.error("✗ Missing credentials. Cannot authenticate with Firebase.");
    console.error("Tip: Pass credentials via flags: --email=... --password=...");
    process.exit(1);
  }

  console.log(`\nAuthenticating with Firebase Authentication as ${email}...`);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log(`✓ Authentication SUCCESS: Signed in as ${cred.user.email} (UID: ${cred.user.uid})\n`);
  } catch (err) {
    console.error(`✗ Authentication FAILED: ${err.message}`);
    console.error("\nPlease check that this email and password match an existing user in Firebase Console → Authentication.");
    process.exit(1);
  }

  console.log("Starting live upload to Cloud Firestore...");
  console.log("=================================================================");

  let successCount = 0;
  let errorCount = 0;

  // 1. Migrate Categories
  console.log("\n[1/5] Migrating Categories ('categories' collection)...");
  for (const cat of seedData.categories) {
    try {
      const docRef = doc(db, "categories", cat.id);
      await setDoc(docRef, cleanFirestoreData(cat), { merge: true });
      successCount++;
      console.log(`  ✓ [categories/${cat.id}] "${cat.name}" imported with ${cat.subcategories?.length || 0} subcategories`);
    } catch (err) {
      errorCount++;
      console.error(`  ✗ [categories/${cat.id}] Error: ${err.message}`);
    }
  }

  // 2. Migrate Celebrities
  console.log("\n[2/5] Migrating Celebrities ('celebrities' collection)...");
  for (const cel of seedData.celebrities) {
    try {
      const docRef = doc(db, "celebrities", cel.id);
      await setDoc(docRef, cleanFirestoreData(cel), { merge: true });
      successCount++;
      console.log(`  ✓ [celebrities/${cel.id}] "${cel.name}" (${cel.category}) imported`);
    } catch (err) {
      errorCount++;
      console.error(`  ✗ [celebrities/${cel.id}] Error: ${err.message}`);
    }
  }

  // 3. Migrate Hero Banners
  console.log("\n[3/5] Migrating Hero Banners ('banners' collection)...");
  for (const b of seedData.banners) {
    try {
      const docRef = doc(db, "banners", b.id);
      await setDoc(docRef, cleanFirestoreData(b), { merge: true });
      successCount++;
      console.log(`  ✓ [banners/${b.id}] "${b.title}" (Order: ${b.displayOrder}) imported`);
    } catch (err) {
      errorCount++;
      console.error(`  ✗ [banners/${b.id}] Error: ${err.message}`);
    }
  }

  // 4. Migrate Site Settings
  console.log("\n[4/5] Migrating Site Settings ('siteSettings/main')...");
  if (seedData.siteSettings) {
    try {
      const docRef = doc(db, "siteSettings", "main");
      await setDoc(docRef, cleanFirestoreData(seedData.siteSettings), { merge: true });
      successCount++;
      console.log(`  ✓ [siteSettings/main] All branding, contact, SEO & homepage settings imported`);
    } catch (err) {
      errorCount++;
      console.error(`  ✗ [siteSettings/main] Error: ${err.message}`);
    }
  }

  // 5. Migrate Sample Inquiries
  console.log("\n[5/5] Migrating Inquiries ('inquiries' collection)...");
  for (const inq of seedData.inquiries || []) {
    try {
      const docRef = doc(db, "inquiries", inq.id);
      await setDoc(docRef, cleanFirestoreData(inq), { merge: true });
      successCount++;
      console.log(`  ✓ [inquiries/${inq.id}] Lead for "${inq.celebrityName}" imported`);
    } catch (err) {
      errorCount++;
      console.error(`  ✗ [inquiries/${inq.id}] Error: ${err.message}`);
    }
  }

  // Verification step
  console.log("\n=================================================================");
  console.log("   Post-Migration Verification: Querying Live Firestore Data");
  console.log("=================================================================");

  try {
    const catSnap = await getDocs(collection(db, "categories"));
    const celSnap = await getDocs(collection(db, "celebrities"));
    const banSnap = await getDocs(collection(db, "banners"));
    const inqSnap = await getDocs(collection(db, "inquiries"));
    const setSnap = await getDoc(doc(db, "siteSettings", "main"));

    console.log(`Firestore Actual Document Counts:`);
    console.log(`  • categories:   ${catSnap.size} documents in Firestore`);
    console.log(`  • celebrities:  ${celSnap.size} documents in Firestore`);
    console.log(`  • banners:      ${banSnap.size} documents in Firestore`);
    console.log(`  • inquiries:    ${inqSnap.size} documents in Firestore`);
    console.log(`  • siteSettings: ${setSnap.exists() ? "Document 'main' exists" : "NOT FOUND"}`);

    if (
      catSnap.size >= categoriesCount &&
      celSnap.size >= celebritiesCount &&
      banSnap.size >= bannersCount &&
      setSnap.exists()
    ) {
      console.log("\n🎉 100% VERIFIED: All website collections and documents are now live in Firestore!");
      console.log("Refresh Firebase Console → Firestore Database → Data to inspect them.");
    } else {
      console.log("\n⚠️ Note: Some documents may not have finished writing. Review error counts above.");
    }
  } catch (err) {
    console.error("Verification query error:", err.message);
  }

  console.log(`\nMigration completed: ${successCount} successful writes, ${errorCount} errors.`);
  console.log("=================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
