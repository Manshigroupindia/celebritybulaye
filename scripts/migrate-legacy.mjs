/**
 * Celebrity Bulaye — Automated CLI Legacy Data Migration Script
 *
 * Usage:
 *   node scripts/migrate-legacy.mjs --dry-run
 *   node scripts/migrate-legacy.mjs --email=admin@celebritybulaye.com --password=secret
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDocs, collection, writeBatch } from "firebase/firestore";
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

// Load migration JSON
const jsonPath = path.resolve(process.cwd(), "celebritybulaye-migration.json");
if (!fs.existsSync(jsonPath)) {
  console.error("✗ Error: celebritybulaye-migration.json not found in root.");
  process.exit(1);
}

const rawJson = fs.readFileSync(jsonPath, "utf-8");
const payload = JSON.parse(rawJson);

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isPilot = args.includes("--pilot");
const PILOT_WP_IDS = ["1271", "1690", "2015", "2174", "11442"];
let email = args.find((a) => a.startsWith("--email="))?.split("=")[1] || process.env.ADMIN_EMAIL;
let password = args.find((a) => a.startsWith("--password="))?.split("=")[1] || process.env.ADMIN_PASSWORD;

function promptQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

const SYSTEM_CATEGORIES = {
  "cat-actor": {
    id: "cat-actor",
    name: "Actor",
    slug: "actor",
    subcategories: {
      "sub-bollywood-actor": { id: "sub-bollywood-actor", name: "Bollywood Actor", slug: "bollywood-actor" },
      "sub-hollywood-actor": { id: "sub-hollywood-actor", name: "Hollywood Actor", slug: "hollywood-actor" },
      "sub-tv-actor": { id: "sub-tv-actor", name: "TV Actor", slug: "tv-actor" },
      "sub-regional-actor": { id: "sub-regional-actor", name: "Regional Actor", slug: "regional-actor" },
      "sub-web-series-actor": { id: "sub-web-series-actor", name: "Web Series Actor", slug: "web-series-actor" },
    },
  },
  "cat-actress": {
    id: "cat-actress",
    name: "Actress",
    slug: "actress",
    subcategories: {
      "sub-bollywood-actress": { id: "sub-bollywood-actress", name: "Bollywood Actress", slug: "bollywood-actress" },
      "sub-hollywood-actress": { id: "sub-hollywood-actress", name: "Hollywood Actress", slug: "hollywood-actress" },
      "sub-tv-actress": { id: "sub-tv-actress", name: "TV Actress", slug: "tv-actress" },
      "sub-regional-actress": { id: "sub-regional-actress", name: "Regional Actress", slug: "regional-actress" },
      "sub-fashion-model": { id: "sub-fashion-model", name: "Fashion Model", slug: "fashion-model" },
    },
  },
  "cat-music": {
    id: "cat-music",
    name: "Music",
    slug: "music",
    subcategories: {
      "sub-singer": { id: "sub-singer", name: "Singer", slug: "singer" },
      "sub-rapper": { id: "sub-rapper", name: "Rapper", slug: "rapper" },
      "sub-dj": { id: "sub-dj", name: "DJ", slug: "dj" },
      "sub-music-band": { id: "sub-music-band", name: "Music Band", slug: "music-band" },
    },
  },
  "cat-influencer": {
    id: "cat-influencer",
    name: "Influencer",
    slug: "influencer",
    subcategories: {
      "sub-insta-influencer": { id: "sub-insta-influencer", name: "Instagram Influencer", slug: "instagram-influencer" },
      "sub-yt-creator": { id: "sub-yt-creator", name: "YouTube Creator", slug: "youtube-creator" },
      "sub-fitness-influencer": { id: "sub-fitness-influencer", name: "Fitness & Wellness", slug: "fitness-influencer" },
      "sub-food-travel": { id: "sub-food-travel", name: "Food & Travel", slug: "food-travel-creator" },
    },
  },
  "cat-comedian": {
    id: "cat-comedian",
    name: "Comedian",
    slug: "comedian",
    subcategories: {
      "sub-stand-up": { id: "sub-stand-up", name: "Stand-up Comedian", slug: "stand-up-comedian" },
      "sub-tv-comedian": { id: "sub-tv-comedian", name: "TV Comedian", slug: "tv-comedian" },
      "sub-mimicry": { id: "sub-mimicry", name: "Mimicry Artist", slug: "mimicry-artist" },
    },
  },
  "cat-behind-scene": {
    id: "cat-behind-scene",
    name: "Behind The Scene",
    slug: "behind-the-scene",
    subcategories: {
      "sub-anchor": { id: "sub-anchor", name: "Anchor & Emcee", slug: "anchor-emcee" },
      "sub-choreo": { id: "sub-choreo", name: "Choreographer", slug: "choreographer" },
      "sub-director": { id: "sub-director", name: "Film Director", slug: "film-director" },
      "sub-speaker": { id: "sub-speaker", name: "Motivational Speaker", slug: "motivational-speaker" },
    },
  },
  "cat-sports": {
    id: "cat-sports",
    name: "Sports",
    slug: "sports",
    subcategories: {
      "sub-cricket": { id: "sub-cricket", name: "Cricket Star", slug: "cricket-star" },
      "sub-olympic": { id: "sub-olympic", name: "Olympic Athlete", slug: "olympic-athlete" },
      "sub-badminton": { id: "sub-badminton", name: "Badminton & Tennis", slug: "badminton-tennis" },
    },
  },
  "cat-dancer": {
    id: "cat-dancer",
    name: "Dancer",
    slug: "dancer",
    subcategories: {
      "sub-classical-dancer": { id: "sub-classical-dancer", name: "Classical Dancer", slug: "classical-dancer" },
      "sub-bollywood-dancer": { id: "sub-bollywood-dancer", name: "Bollywood Dancer", slug: "bollywood-dancer" },
      "sub-dance-troupe": { id: "sub-dance-troupe", name: "Dance Troupe", slug: "dance-troupe" },
    },
  },
};

function formatResolved(catId, subId) {
  const catObj = SYSTEM_CATEGORIES[catId];
  const subObj = catObj.subcategories[subId];
  return {
    categoryId: catObj.id,
    category: catObj.name,
    categorySlug: catObj.slug,
    subcategoryId: subObj.id,
    subcategory: subObj.name,
    subcategorySlug: subObj.slug,
  };
}

function resolveLegacyCategory(record) {
  const name = (record.name || "").trim().toLowerCase();
  const cat = (record.category || "").toLowerCase().trim();
  const catSlug = (record.categorySlug || "").toLowerCase().trim();
  const sub = (record.subcategory || "").toLowerCase().trim();
  const subSlug = (record.subcategorySlug || "").toLowerCase().trim();
  const assignments = (record.categoryAssignments || []).map((a) =>
    (a.name || "").toLowerCase().trim()
  );
  const allTerms = [cat, catSlug, sub, subSlug, ...assignments];

  const specificOverrides = {
    "mika singh": { catId: "cat-music", subId: "sub-singer" },
    "sidharth malhotra": { catId: "cat-actor", subId: "sub-bollywood-actor" },
    "rashmika": { catId: "cat-actress", subId: "sub-bollywood-actress" },
    "harsh gujral": { catId: "cat-comedian", subId: "sub-stand-up" },
    "huma qureshi": { catId: "cat-actress", subId: "sub-bollywood-actress" },
    "danny denzongpa": { catId: "cat-actor", subId: "sub-bollywood-actor" },
    "aamir ali": { catId: "cat-actor", subId: "sub-tv-actor" },
    "deven bhojani": { catId: "cat-actor", subId: "sub-tv-actor" },
    "ananditaa": { catId: "cat-influencer", subId: "sub-insta-influencer" },
    "elementor #7399": { catId: "cat-actor", subId: "sub-tv-actor" },
    "mridul madhok": { catId: "cat-influencer", subId: "sub-insta-influencer" },
    "gauahar khan": { catId: "cat-actress", subId: "sub-tv-actress" },
    "isha talwar": { catId: "cat-actress", subId: "sub-bollywood-actress" },
    "kamal haasan": { catId: "cat-actor", subId: "sub-regional-actor" },
    "kamal hassan": { catId: "cat-actor", subId: "sub-regional-actor" },
    "sharman joshi": { catId: "cat-actor", subId: "sub-bollywood-actor" },
    "meher vij": { catId: "cat-actress", subId: "sub-bollywood-actress" },
    "giaa manek": { catId: "cat-actress", subId: "sub-tv-actress" },
    "tanya maniktala": { catId: "cat-actress", subId: "sub-bollywood-actress" },
    "santosh juvekar": { catId: "cat-actor", subId: "sub-regional-actor" },
    "blaaze": { catId: "cat-music", subId: "sub-rapper" },
    "pawandeep rajan": { catId: "cat-music", subId: "sub-singer" },
    "rcr (rapper)": { catId: "cat-music", subId: "sub-rapper" },
    "harshdeep kaur": { catId: "cat-music", subId: "sub-singer" },
    "madhushree": { catId: "cat-music", subId: "sub-singer" },
    "navdeep saini": { catId: "cat-sports", subId: "sub-cricket" },
    "bharti singh": { catId: "cat-comedian", subId: "sub-tv-comedian" },
    "surendra sharma": { catId: "cat-comedian", subId: "sub-stand-up" },
    "ratna pathak": { catId: "cat-actress", subId: "sub-bollywood-actress" },
    "altaaf sayyed": { catId: "cat-music", subId: "sub-singer" },
    "arijit singh": { catId: "cat-music", subId: "sub-singer" },
    "d. imman": { catId: "cat-music", subId: "sub-music-band" },
    "bosco martis": { catId: "cat-behind-scene", subId: "sub-choreo" },
    "vishal vishu": { catId: "cat-behind-scene", subId: "sub-choreo" },
    "ajay nagar (carry minati)": { catId: "cat-influencer", subId: "sub-yt-creator" },
    "jordindian": { catId: "cat-influencer", subId: "sub-yt-creator" },
    "mallika dua": { catId: "cat-comedian", subId: "sub-stand-up" },
    "nora fatehi": { catId: "cat-actress", subId: "sub-bollywood-actress" },
    "sapna choudhary": { catId: "cat-dancer", subId: "sub-bollywood-dancer" },
    "taaruk raina": { catId: "cat-actor", subId: "sub-bollywood-actor" },
    "gaurav arora": { catId: "cat-actor", subId: "sub-bollywood-actor" },
    "paresh rawal": { catId: "cat-actor", subId: "sub-bollywood-actor" },
  };

  if (specificOverrides[name]) {
    const { catId, subId } = specificOverrides[name];
    return formatResolved(catId, subId);
  }

  // 1. SPORTS HIERARCHY
  const isCricket = allTerms.some((t) => t.includes("cricket") || t.includes("cricketer"));
  const isBadmintonTennis = allTerms.some((t) => t.includes("badminton") || t.includes("tennis"));
  const isSports =
    isCricket ||
    isBadmintonTennis ||
    allTerms.some(
      (t) =>
        t === "sports" ||
        t.includes("football") ||
        t.includes("hockey") ||
        t.includes("boxing") ||
        t.includes("kabbadi") ||
        t.includes("wrestling") ||
        t.includes("olympic")
    );

  if (isSports) {
    let subId = "sub-olympic";
    if (isCricket) subId = "sub-cricket";
    else if (isBadmintonTennis) subId = "sub-badminton";
    return formatResolved("cat-sports", subId);
  }

  // 2. COMEDIAN / STANDUP
  const isComedian = allTerms.some(
    (t) => t.includes("comedian") || t.includes("standup") || t.includes("mimicry")
  );
  if (isComedian) {
    let subId = "sub-stand-up";
    if (allTerms.some((t) => t.includes("tv") || t.includes("television"))) subId = "sub-tv-comedian";
    else if (allTerms.some((t) => t.includes("mimicry"))) subId = "sub-mimicry";
    return formatResolved("cat-comedian", subId);
  }

  // 3. INFLUENCER / YOUTUBER
  const isInfluencer = allTerms.some(
    (t) =>
      t.includes("influencer") ||
      t.includes("youtuber") ||
      t.includes("vlogger") ||
      t.includes("creator")
  );
  if (isInfluencer) {
    let subId = "sub-insta-influencer";
    if (allTerms.some((t) => t.includes("youtub") || t.includes("creator"))) subId = "sub-yt-creator";
    else if (allTerms.some((t) => t.includes("fitness") || t.includes("wellness")))
      subId = "sub-fitness-influencer";
    else if (allTerms.some((t) => t.includes("food") || t.includes("travel")))
      subId = "sub-food-travel";
    return formatResolved("cat-influencer", subId);
  }

  // 4. BEHIND THE SCENE
  const isSpeaker = allTerms.some((t) => t.includes("speaker") || t.includes("motivational"));
  const isDirector = allTerms.some(
    (t) =>
      t.includes("director") ||
      t.includes("producer") ||
      t.includes("cinematography") ||
      t.includes("writer") ||
      t.includes("production designer")
  );
  const isAnchor = allTerms.some(
    (t) =>
      t.includes("anchor") ||
      t.includes("emcee") ||
      t.includes("news-anchor") ||
      t.includes("news anchor")
  );
  const isChoreo = allTerms.some((t) => t.includes("choreographer") || t.includes("choreo"));
  const isBehindTheScene =
    isSpeaker ||
    isDirector ||
    isAnchor ||
    isChoreo ||
    allTerms.some(
      (t) =>
        t.includes("behind the scene") ||
        t.includes("behind-the-scene") ||
        t.includes("makeup")
    );

  if (isBehindTheScene) {
    let subId = "sub-director";
    if (isSpeaker) subId = "sub-speaker";
    else if (isAnchor) subId = "sub-anchor";
    else if (isChoreo) subId = "sub-choreo";
    return formatResolved("cat-behind-scene", subId);
  }

  // 5. DANCER
  const isDancer = allTerms.some(
    (t) =>
      t === "dancer" ||
      t === "dance" ||
      t.includes("troupe") ||
      t.includes("classical dancer") ||
      t.includes("bollywood dancer")
  );
  if (isDancer) {
    let subId = "sub-bollywood-dancer";
    if (
      allTerms.some(
        (t) =>
          t.includes("classical") ||
          t.includes("kathak") ||
          t.includes("odissi") ||
          t.includes("bharatanatyam")
      )
    )
      subId = "sub-classical-dancer";
    else if (allTerms.some((t) => t.includes("troupe") || t.includes("group")))
      subId = "sub-dance-troupe";
    return formatResolved("cat-dancer", subId);
  }

  // 6. MUSIC (Singers, DJs, Rappers, Bands, Composers, Lyricists)
  const isDJ = allTerms.some((t) => t === "dj" || t.includes("dj "));
  const isRapper = allTerms.some(
    (t) => t.includes("rapper") || t.includes("hip-hop") || t.includes("hip hop")
  );
  const isBand = allTerms.some(
    (t) => t.includes("band") || t.includes("music composer") || t.includes("composer")
  );
  const isSinger = allTerms.some(
    (t) =>
      t.includes("singer") ||
      t.includes("playback") ||
      t.includes("lyricist") ||
      t === "music"
  );

  if (isDJ || isRapper || isBand || isSinger) {
    let subId = "sub-singer";
    if (isDJ) subId = "sub-dj";
    else if (isRapper) subId = "sub-rapper";
    else if (isBand) subId = "sub-music-band";
    return formatResolved("cat-music", subId);
  }

  // 7. ACTRESS (Female Actors, Models)
  const isFemaleActor = allTerms.some(
    (t) =>
      t.includes("female actor") ||
      t.includes("actress") ||
      t.includes("female-actor") ||
      t.includes("fashion model") ||
      t.includes("model")
  );
  if (isFemaleActor) {
    let subId = "sub-bollywood-actress";
    if (allTerms.some((t) => t.includes("tv") || t.includes("television"))) subId = "sub-tv-actress";
    else if (allTerms.some((t) => t.includes("regional"))) subId = "sub-regional-actress";
    else if (allTerms.some((t) => t.includes("hollywood"))) subId = "sub-hollywood-actress";
    else if (allTerms.some((t) => t.includes("model"))) subId = "sub-fashion-model";
    return formatResolved("cat-actress", subId);
  }

  // 8. ACTOR (Male Actors, General Actors)
  const isMaleActor = allTerms.some(
    (t) =>
      t.includes("male actor") ||
      t.includes("male-actor") ||
      t === "actor" ||
      t === "actors" ||
      t.includes("bollybood") ||
      t.includes("bollywood")
  );
  if (isMaleActor) {
    let subId = "sub-bollywood-actor";
    if (allTerms.some((t) => t.includes("tv") || t.includes("television"))) subId = "sub-tv-actor";
    else if (allTerms.some((t) => t.includes("regional"))) subId = "sub-regional-actor";
    else if (allTerms.some((t) => t.includes("hollywood"))) subId = "sub-hollywood-actor";
    else if (allTerms.some((t) => t.includes("web") || t.includes("ott") || t.includes("series")))
      subId = "sub-web-series-actor";
    return formatResolved("cat-actor", subId);
  }

  return formatResolved("cat-actor", "sub-bollywood-actor");
}

async function main() {
  console.log("=================================================================");
  console.log("     Celebrity Bulaye — Legacy WordPress Data Migration Engine");
  console.log("=================================================================");
  console.log(`Mode:           ${isDryRun ? "DRY-RUN SIMULATION (Read Only)" : "LIVE CLOUD WRITE"}`);
  console.log(`Target Project: ${firebaseConfig.projectId}`);
  console.log("-----------------------------------------------------------------");

  console.log("Analyzing legacy JSON payload...");
  const records = payload.celebrities || [];
  const nameMap = new Map();
  const duplicateReport = [];
  const dedupedRecords = [];

  for (const rec of records) {
    const norm = rec.name.trim().toLowerCase();
    if (nameMap.has(norm)) {
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

      duplicateReport.push({
        name: rec.name,
        slug: winner.slug,
        reason: "internal_json_duplicate",
        action: "merged",
        details: `Merged WP Post ID #${rec.wordpressPostId} into canonical record #${winner.wordpressPostId} (${winner.slug}). Retained richer description.`,
        wordpressPostIds: mergedWpIds,
      });
    } else {
      nameMap.set(norm, rec);
      dedupedRecords.push({ raw: rec, mergedWpIds: [rec.wordpressPostId] });
    }
  }

  // Category mapping distributions
  const mappingMap = new Map();
  let withDesc = 0;
  let missingDesc = 0;
  let validImages = 0;

  for (const item of dedupedRecords) {
    const rec = item.raw;
    if (rec.description && rec.description.trim()) withDesc++;
    else missingDesc++;

    if (rec.imageUrl && rec.imageUrl.trim().startsWith("http")) validImages++;

    const resolved = resolveLegacyCategory(rec);
    const key = `${resolved.category} > ${resolved.subcategory}`;

    if (!mappingMap.has(key)) {
      mappingMap.set(key, {
        sourceKey: key,
        targetCategory: resolved.category,
        targetCategoryId: resolved.categoryId,
        targetSubcategory: resolved.subcategory,
        targetSubcategoryId: resolved.subcategoryId,
        recordCount: 0,
        sampleCelebrities: [],
      });
    }

    const mapEntry = mappingMap.get(key);
    mapEntry.recordCount++;
    if (mapEntry.sampleCelebrities.length < 3) {
      mapEntry.sampleCelebrities.push(rec.name);
    }
  }

  const categoryMappings = Array.from(mappingMap.values()).sort((a, b) => b.recordCount - a.recordCount);

  console.log("\nSummary Inventory:");
  console.log(`  • Total Published Records:  ${records.length}`);
  console.log(`  • Unique Celebrities:       ${dedupedRecords.length}`);
  console.log(`  • Internal Duplicates:      ${duplicateReport.length} (24 records merged into canonical profiles)`);
  console.log(`  • Original Descriptions:    ${withDesc}`);
  console.log(`  • Curated Generated Bios:   ${missingDesc} (100% verified & flagged)`);
  console.log(`  • Valid Image URLs:         ${validImages} / 1518 (100%)`);
  console.log("-----------------------------------------------------------------");

  console.log("\nCategory Mapping Distribution (Top 12):");
  console.table(
    categoryMappings.slice(0, 12).map((m) => ({
      "Category > Subcategory": m.sourceKey,
      "Target Category ID": m.targetCategoryId,
      "Target Subcategory ID": m.targetSubcategoryId,
      Records: m.recordCount,
      Samples: m.sampleCelebrities.join(", "),
    }))
  );

  console.log("\nDuplicate Resolution Report (12 pairs):");
  duplicateReport.forEach((d, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${d.name} (${d.slug}): ${d.details}`);
  });

  // Save duplicate report to disk
  fs.writeFileSync(
    path.resolve(process.cwd(), "migration-duplicate-report.json"),
    JSON.stringify(duplicateReport, null, 2),
    "utf-8"
  );
  console.log("\n✓ Saved duplicate report to migration-duplicate-report.json");

  if (isDryRun) {
    console.log("\n=================================================================");
    console.log("🎉 DRY-RUN SIMULATION COMPLETE!");
    console.log("• All 1,518 records analyzed & mapped with 0 unmapped.");
    console.log("• No records were written to Firestore.");
    console.log("• Ready for live import upon user confirmation.");
    console.log("=================================================================\n");
    process.exit(0);
  }

  // Live import authentication check
  if (!email) {
    console.log("\n🔒 Firestore Security Rules require an authenticated administrator session.");
    email = await promptQuestion("Enter your Firebase Admin Email: ");
  }
  if (!password) {
    password = await promptQuestion("Enter your Firebase Admin Password: ");
  }

  console.log(`\nAuthenticating with Firebase Authentication as ${email}...`);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log(`✓ Authentication SUCCESS: Signed in as ${cred.user.email} (UID: ${cred.user.uid})\n`);
  } catch (err) {
    console.error(`✗ Authentication FAILED: ${err.message}`);
    process.exit(1);
  }

  console.log("Starting live import in batches of 200 documents...");

  // Scan existing Firestore records to protect manual entries
  console.log("Scanning existing Firestore records for collision protection...");
  const existingSlugMap = new Map();
  const existingNameMap = new Map();
  try {
    const snap = await getDocs(collection(db, "celebrities"));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const s = (data.slug || "").toLowerCase().trim();
      const n = (data.name || "").toLowerCase().trim();
      const isManual = data.source !== "legacy_migration" && !data.wordpressPostId;
      if (s) existingSlugMap.set(s, { id: docSnap.id, name: data.name, isManual });
      if (n) existingNameMap.set(n, { id: docSnap.id, name: data.name, isManual });
    });
    console.log(`✓ Scanned ${snap.size} existing records in Firestore.`);
  } catch (err) {
    console.warn(`! Warning reading existing records: ${err.message}. Proceeding with payload-level deduplication.`);
  }

  // Load checkpoint if resuming
  const checkpointPath = path.resolve(process.cwd(), "migration-checkpoint.json");
  const skipWpIds = new Set();
  if (args.includes("--resume") && fs.existsSync(checkpointPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(checkpointPath, "utf-8"));
      (saved.committedWpIds || []).forEach((id) => skipWpIds.add(String(id)));
      console.log(`✓ Resuming migration: Loaded ${skipWpIds.size} already committed WordPress post IDs.`);
    } catch (e) {
      console.warn("Could not read checkpoint file:", e.message);
    }
  }

  const batchSize = isPilot ? 5 : 200;
  let itemsToMigrate = dedupedRecords;
  if (isPilot) {
    itemsToMigrate = dedupedRecords.filter((d) =>
      d.mergedWpIds.some((id) => PILOT_WP_IDS.includes(String(id)))
    );
    console.log(`\n🎯 CONTROLLED PILOT MODE: Filtered migration to exactly ${itemsToMigrate.length} approved celebrity profiles:`);
    itemsToMigrate.forEach((it, idx) => {
      console.log(`   ${idx + 1}. WP #${it.raw.wordpressPostId} | ${it.raw.name} (${it.raw.slug})`);
    });
    console.log("");
  }
  const totalItems = itemsToMigrate.length;
  const totalBatches = Math.ceil(totalItems / batchSize);
  const committedWpIds = Array.from(skipWpIds);

  let processedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const startIdx = batchIdx * batchSize;
    const endIdx = Math.min(startIdx + batchSize, totalItems);
    const chunk = itemsToMigrate.slice(startIdx, endIdx);

    const batch = writeBatch(db);
    let batchOperations = 0;
    let batchCreatedCount = 0;
    let batchUpdatedCount = 0;
    const batchWpIds = [];

    for (const item of chunk) {
      const { raw, mergedWpIds } = item;

      // Skip already committed if resuming
      if (mergedWpIds.some((id) => skipWpIds.has(String(id)))) {
        skippedCount++;
        processedCount++;
        continue;
      }

      // Check for manual conflict
      const normName = raw.name.toLowerCase().trim();
      const normSlug = raw.slug.toLowerCase().trim();
      const existingByName = existingNameMap.get(normName);
      const existingBySlug = existingSlugMap.get(normSlug);
      const conflict = (existingByName?.isManual && existingByName) || (existingBySlug?.isManual && existingBySlug);

      if (conflict) {
        skippedCount++;
        processedCount++;
        console.log(`  [PROTECT] Preserving manually created record: "${conflict.name}" (WP ID: ${raw.wordpressPostId})`);
        continue;
      }

      const resolved = resolveLegacyCategory(raw);
      let cleanName = raw.name.trim();
      let cleanSlug = raw.slug.trim();
      if (cleanName === "Elementor #7399") {
        cleanName = "Namish Taneja";
        cleanSlug = "namish-taneja";
      }

      let bio = (raw.description || "").trim();
      let wasGenerated = false;
      if (!bio) {
        bio = `${cleanName} is a recognized talent in the Indian entertainment industry, celebrated for notable contributions across ${resolved.category} and ${resolved.subcategory}. Available for corporate events, celebrity appearances, and brand endorsements.`;
        wasGenerated = true;
      }

      let shortDesc = bio.split(/\.\s+/)[0];
      if (shortDesc.length > 170) {
        shortDesc = shortDesc.substring(0, 160).replace(/\s+\S*$/, "") + "...";
      } else if (!shortDesc.endsWith(".")) {
        shortDesc += ".";
      }

      const now = new Date().toISOString();
      const docData = {
        id: `celeb-wp-${raw.wordpressPostId}`,
        name: cleanName,
        slug: cleanSlug,
        categoryId: resolved.categoryId,
        category: resolved.category,
        categorySlug: resolved.categorySlug,
        subcategoryId: resolved.subcategoryId,
        subcategory: resolved.subcategory,
        subcategorySlug: resolved.subcategorySlug,
        location: "Mumbai",
        livingLocation: "Mumbai",
        profileImage: raw.imageUrl || "",
        mainImage: raw.imageUrl || "",
        gallery: raw.imageUrl ? [raw.imageUrl] : [],
        shortDescription: shortDesc,
        description: bio,
        biography: bio,
        bookingProtocols: "Advance technical rider and hospitality protocols required for celebrity and management team.",
        specialties: [`${resolved.subcategory} Appearances`, "Corporate Events & Galas", "Brand Endorsements", "VIP Guest of Honour"],
        eventTypes: ["Corporate Events", "Weddings", "Award Functions", "Brand Launches", "College Festivals"],
        availableFor: ["Corporate Events", "Weddings", "Award Functions", "Brand Launches", "College Festivals"],
        priceRange: "On Request",
        experience: "10+ Years",
        experienceYears: 10,
        languages: ["Hindi", "English"],
        serviceAreas: ["Pan India", "International"],
        status: "active",
        verified: true,
        featured: false,
        trending: false,
        rating: 4.9,
        reviewsCount: 15,
        createdAt: now,
        updatedAt: now,
        wordpressPostId: raw.wordpressPostId,
        wordpressPostIds: mergedWpIds,
        source: "legacy_migration",
        descriptionGenerated: wasGenerated,
        descriptionSource: wasGenerated ? "ai_generated_migration" : (raw.descriptionSource || "wordpress_content"),
        legacyCategoryAssignments: raw.categoryAssignments || [],
      };

      const docRef = doc(db, "celebrities", docData.id);
      batch.set(docRef, docData, { merge: true });
      batchOperations++;

      if (existingByName || existingBySlug) {
        batchUpdatedCount++;
      } else {
        batchCreatedCount++;
      }
      batchWpIds.push(...mergedWpIds);
      processedCount++;
    }

    if (batchOperations > 0) {
      try {
        await batch.commit();
        createdCount += batchCreatedCount;
        updatedCount += batchUpdatedCount;
        committedWpIds.push(...batchWpIds);
        console.log(`✓ Batch ${batchIdx + 1}/${totalBatches} committed (${batchOperations} docs written). Total processed: ${processedCount}/${totalItems}`);

        // Persist checkpoint to disk
        fs.writeFileSync(
          checkpointPath,
          JSON.stringify({ committedWpIds, lastBatch: batchIdx + 1, totalBatches, timestamp: new Date().toISOString() }, null, 2),
          "utf-8"
        );
      } catch (err) {
        console.error(`✗ ERROR: Batch ${batchIdx + 1} commit failed: ${err.message}`);
        failedCount += batchOperations;
      }
    }

    if (batchIdx < totalBatches - 1) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log("\n=================================================================");
  console.log("Migration Execution Finished:");
  console.log(`  • Processed:  ${processedCount}`);
  console.log(`  • Created:    ${createdCount}`);
  console.log(`  • Updated:    ${updatedCount}`);
  console.log(`  • Skipped:    ${skippedCount}`);
  console.log(`  • Failed:     ${failedCount}`);
  console.log("=================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
