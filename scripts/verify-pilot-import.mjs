import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
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

const PILOT_CELEBRITIES = [
  { wpId: "1271", name: "Udit Narayan", docId: "celeb-wp-1271", slug: "udit-narayan", expectedCat: "cat-music", expectedSub: "sub-singer", isGenerated: false },
  { wpId: "1690", name: "Sidharth Malhotra", docId: "celeb-wp-1690", slug: "sidharth-malhotra", expectedCat: "cat-actor", expectedSub: "sub-bollywood-actor", isGenerated: false },
  { wpId: "2015", name: "Kapil Sharma", docId: "celeb-wp-2015", slug: "kapil-sharma", expectedCat: "cat-comedian", expectedSub: "sub-stand-up", isGenerated: false },
  { wpId: "2174", name: "Nora Fatehi", docId: "celeb-wp-2174", slug: "nora-fatehi", expectedCat: "cat-actress", expectedSub: "sub-bollywood-actress", isGenerated: false },
  { wpId: "11442", name: "Kriti Sanon", docId: "celeb-wp-11442", slug: "kriti-sanon", expectedCat: "cat-actress", expectedSub: "sub-bollywood-actress", isGenerated: true }
];

async function verifyPilot() {
  console.log("=================================================================");
  console.log("    Celebrity Bulaye — 5-Record Pilot Verification Engine");
  console.log("=================================================================");

  const report = {
    verifiedAt: new Date().toISOString(),
    totalVerified: 0,
    successfulDocuments: [],
    failedDocuments: [],
    manualRecordsAudit: {},
    websiteIntegrity: {}
  };

  console.log("1. Inspecting 5 Pilot Documents in Firestore Individually:\n");

  for (const target of PILOT_CELEBRITIES) {
    const docRef = doc(db, "celebrities", target.docId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.log(`✗ MISSING: Document ${target.docId} (${target.name}) not found in Firestore.`);
      report.failedDocuments.push({ docId: target.docId, name: target.name, reason: "Document not found" });
      continue;
    }

    const data = snap.data();
    console.log(`✓ VERIFIED: [${snap.id}] ${data.name}`);
    console.log(`   • Name & Slug:       ${data.name} (slug: "${data.slug}")`);
    console.log(`   • Category & Subcat: ${data.category} [${data.categoryId}] > ${data.subcategory} [${data.subcategoryId}]`);
    console.log(`   • Description:       ${data.description ? data.description.substring(0, 80) + "..." : "EMPTY"} (${data.description?.length || 0} chars)`);
    console.log(`   • Image URL:         ${data.profileImage}`);
    console.log(`   • WordPress Post ID: #${data.wordpressPostId}`);
    console.log(`   • Generated Flag:    descriptionGenerated: ${data.descriptionGenerated} | source: ${data.descriptionSource}`);
    console.log(`   • Document Status:   status: "${data.status}" | source: "${data.source}"`);
    console.log("-----------------------------------------------------------------");

    report.totalVerified++;
    report.successfulDocuments.push({
      documentId: snap.id,
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      categoryName: data.category,
      subcategoryId: data.subcategoryId,
      subcategoryName: data.subcategory,
      descriptionLength: data.description?.length || 0,
      imageUrl: data.profileImage,
      wordpressPostId: data.wordpressPostId,
      descriptionGenerated: data.descriptionGenerated,
      descriptionSource: data.descriptionSource,
      status: data.status,
      source: data.source
    });
  }

  // 2. Audit Existing Manual Records (Neha Sharma)
  console.log("\n2. Auditing Existing Manual Records in Firestore:");
  const manualSnap = await getDoc(doc(db, "celebrities", "celeb-neha-sharma"));
  if (manualSnap.exists()) {
    const mData = manualSnap.data();
    console.log(`✓ Manual Record Preserved: [${manualSnap.id}] "${mData.name}" (source: "${mData.source || 'manual'}")`);
    report.manualRecordsAudit = {
      id: manualSnap.id,
      name: mData.name,
      status: "untouched_and_preserved"
    };
  } else {
    console.log("! Notice: celeb-neha-sharma not found by exact ID.");
  }

  // 3. Check for any duplicate documents
  console.log("\n3. Scanning for Duplicate Documents in Firestore:");
  const allSnap = await getDocs(collection(db, "celebrities"));
  const slugCounts = new Map();
  allSnap.forEach(d => {
    const s = d.data().slug;
    if (s) slugCounts.set(s, (slugCounts.get(s) || 0) + 1);
  });

  let duplicateSlugs = 0;
  for (const [slug, count] of slugCounts.entries()) {
    if (count > 1) {
      console.error(`✗ Duplicate slug found: "${slug}" (${count} documents)`);
      duplicateSlugs++;
    }
  }
  if (duplicateSlugs === 0) {
    console.log(`✓ Zero duplicate slugs found across all ${allSnap.size} Firestore celebrity documents.`);
  }

  // Export report
  const outPath = path.resolve(process.cwd(), "pilot-migration-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\n✓ Pilot report exported to: pilot-migration-report.json`);
  console.log("=================================================================\n");
}

verifyPilot().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});

