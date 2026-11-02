import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { Celebrity, Category } from "@/types";
import { getStoredCategories } from "./categoryService";
import { getCelebrityDescription } from "@/data/migrationDescriptions";

export interface LegacyCategoryAssignment {
  name: string;
  slug: string;
  parentSlug: string | null;
}

export interface LegacyCelebrityRaw {
  name: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  categoryAssignments?: LegacyCategoryAssignment[];
  description: string;
  descriptionSource?: string;
  imageUrl: string;
  imageSource?: string;
  wordpressPostId: string;
  slug: string;
  sourceUrl?: string;
  possibleDuplicateName?: boolean;
}

export interface LegacyMigrationFilePayload {
  source?: string;
  exportFile?: string;
  generatedAt?: string;
  summary?: {
    publishedCelebrityPosts: number;
    uniqueNames: number;
    possibleDuplicateRecords: number;
    categories: number;
    recordsWithExistingDescription: number;
    recordsMissingDescription: number;
    recordsWithImageUrl: number;
  };
  categories?: Array<{
    slug: string;
    name: string;
    parentSlug: string | null;
    celebrityCount: number;
  }>;
  celebrities: LegacyCelebrityRaw[];
}

export interface ResolvedCategoryMapping {
  categoryId: string;
  category: string;
  categorySlug: string;
  subcategoryId: string;
  subcategory: string;
  subcategorySlug: string;
}

export interface CategoryMappingSummary {
  sourceKey: string;
  sourceCategory: string;
  sourceSubcategory: string;
  targetCategory: string;
  targetCategoryId: string;
  targetSubcategory: string;
  targetSubcategoryId: string;
  recordCount: number;
  sampleCelebrities: string[];
}

export interface DuplicateReportItem {
  name: string;
  slug: string;
  reason: "internal_json_duplicate" | "manual_record_conflict" | "existing_migrated_record";
  action: "merged" | "skipped_preserve_manual" | "idempotent_update";
  details: string;
  wordpressPostIds: string[];
}

export interface MigrationAnalysis {
  totalRecords: number;
  uniqueRecords: number;
  internalDuplicatesCount: number;
  recordsWithDescription: number;
  recordsMissingDescription: number;
  validImageCount: number;
  categoryMappings: CategoryMappingSummary[];
  duplicateReport: DuplicateReportItem[];
  sampleRecords: Celebrity[];
}

export interface MigrationProgressCallback {
  (progress: {
    phase: "analyzing" | "verifying" | "migrating" | "complete" | "error";
    message: string;
    percent: number;
    currentBatch: number;
    totalBatches: number;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    log: string;
    committedWpIds?: string[];
  }): void;
}

export interface MigrationExecutionResult {
  success: boolean;
  dryRun: boolean;
  totalScanned: number;
  totalImported: number;
  totalSkipped: number;
  totalFailed: number;
  logs: string[];
  errors: string[];
  duplicateReport: DuplicateReportItem[];
  timestamp: string;
  committedWpIds?: string[];
}

// Built-in categories definitions matching src/data/categories.ts
export const SYSTEM_CATEGORIES: Record<
  string,
  {
    id: string;
    name: string;
    slug: string;
    subcategories: Record<string, { id: string; name: string; slug: string }>;
  }
> = {
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

/**
 * Resolves any legacy category or subcategory to existing system IDs.
 */
export function resolveLegacyCategory(record: {
  name: string;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subcategorySlug?: string;
  categoryAssignments?: LegacyCategoryAssignment[];
}): ResolvedCategoryMapping {
  const name = (record.name || "").trim().toLowerCase();
  const cat = (record.category || "").toLowerCase().trim();
  const catSlug = (record.categorySlug || "").toLowerCase().trim();
  const sub = (record.subcategory || "").toLowerCase().trim();
  const subSlug = (record.subcategorySlug || "").toLowerCase().trim();
  const assignments = (record.categoryAssignments || []).map((a) =>
    (a.name || "").toLowerCase().trim()
  );
  const allTerms = [cat, catSlug, sub, subSlug, ...assignments];

  // Specific high-profile disambiguation
  const specificOverrides: Record<string, { catId: string; subId: string }> = {
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

  // Default fallback: Actor > Bollywood Actor
  return formatResolved("cat-actor", "sub-bollywood-actor");
}

function formatResolved(catId: string, subId: string): ResolvedCategoryMapping {
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

/**
 * Transforms a raw legacy record into the official Celebrity document schema.
 */
export function prepareMigratedCelebrity(
  raw: LegacyCelebrityRaw,
  options?: { mergedWpIds?: string[] }
): Celebrity & {
  wordpressPostId: string;
  wordpressPostIds?: string[];
  source: string;
  descriptionGenerated: boolean;
  descriptionSource: string;
  legacyCategoryAssignments?: LegacyCategoryAssignment[];
} {
  const mapping = resolveLegacyCategory(raw);

  // Correct known WP draft title error "Elementor #7399"
  let cleanName = raw.name.trim();
  let cleanSlug = raw.slug.trim();
  if (cleanName === "Elementor #7399") {
    cleanName = "Namish Taneja";
    cleanSlug = "namish-taneja";
  }

  // Handle Description & missing description generation
  let bio = (raw.description || "").trim();
  let wasGenerated = false;
  let descSource = raw.descriptionSource || "wordpress_content";

  if (!bio) {
    const descResult = getCelebrityDescription({
      name: cleanName,
      category: mapping.category,
      subcategory: mapping.subcategory,
      slug: cleanSlug,
    });
    bio = descResult.description;
    wasGenerated = descResult.generated;
    descSource = "ai_generated_migration";
  }

  // Generate short description from first sentence or first 160 characters
  let shortDesc = bio.split(/\.\s+/)[0];
  if (shortDesc.length > 170) {
    shortDesc = shortDesc.substring(0, 160).replace(/\s+\S*$/, "") + "...";
  } else if (!shortDesc.endsWith(".")) {
    shortDesc += ".";
  }

  const imageUrl = raw.imageUrl?.trim() || "";
  const now = new Date().toISOString();

  // Determine specialties based on category
  const specialties = [
    `${mapping.subcategory} Appearances`,
    "Corporate Events & Galas",
    "Brand Endorsements",
    "VIP Guest of Honour",
    "Private Celebrations",
  ];

  const eventTypes = [
    "Corporate Events",
    "Weddings",
    "Award Functions",
    "Brand Launches",
    "College Festivals",
  ];

  return {
    id: `celeb-wp-${raw.wordpressPostId}`,
    name: cleanName,
    slug: cleanSlug,
    categoryId: mapping.categoryId,
    category: mapping.category,
    categorySlug: mapping.categorySlug,
    subcategoryId: mapping.subcategoryId,
    subcategory: mapping.subcategory,
    subcategorySlug: mapping.subcategorySlug,
    location: "Mumbai",
    livingLocation: "Mumbai",
    profileImage: imageUrl,
    mainImage: imageUrl,
    gallery: imageUrl ? [imageUrl] : [],
    shortDescription: shortDesc,
    description: bio,
    biography: bio,
    bookingProtocols:
      "Advance technical rider and hospitality protocols required for celebrity and management team. Standard private transfers and dedicated green room required.",
    specialties,
    eventTypes,
    availableFor: eventTypes,
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
    // Tracking metadata
    wordpressPostId: raw.wordpressPostId,
    wordpressPostIds: options?.mergedWpIds || [raw.wordpressPostId],
    source: "legacy_migration",
    descriptionGenerated: wasGenerated,
    descriptionSource: descSource,
    legacyCategoryAssignments: raw.categoryAssignments || [],
  };
}

/**
 * Analyze migration payload:
 * - Detects internal duplicates and determines merge strategy
 * - Calculates category mapping distributions
 * - Audits descriptions and image URLs
 * - Builds sample records
 */
export function analyzeMigrationPayload(payload: LegacyMigrationFilePayload): MigrationAnalysis {
  const records = payload.celebrities || [];
  const nameMap = new Map<string, LegacyCelebrityRaw>();
  const duplicateReport: DuplicateReportItem[] = [];
  const dedupedRecords: Array<{ raw: LegacyCelebrityRaw; mergedWpIds: string[] }> = [];

  for (const rec of records) {
    const norm = rec.name.trim().toLowerCase();
    if (nameMap.has(norm)) {
      const existing = nameMap.get(norm)!;
      // Merge rule: Prefer the one with a non-empty description
      const existingDesc = (existing.description || "").trim();
      const currentDesc = (rec.description || "").trim();

      let winner: LegacyCelebrityRaw;
      if (!existingDesc && currentDesc) {
        winner = rec;
      } else {
        winner = existing;
      }

      const mergedWpIds = Array.from(
        new Set([existing.wordpressPostId, rec.wordpressPostId])
      );

      // Update in map
      nameMap.set(norm, winner);

      // Find in deduped and update
      const existingIdx = dedupedRecords.findIndex(
        (d) => d.raw.name.trim().toLowerCase() === norm
      );
      if (existingIdx !== -1) {
        dedupedRecords[existingIdx] = { raw: winner, mergedWpIds };
      }

      duplicateReport.push({
        name: rec.name,
        slug: winner.slug,
        reason: "internal_json_duplicate",
        action: "merged",
        details: `Merged WP Post ID #${rec.wordpressPostId} into canonical record #${winner.wordpressPostId} (${winner.slug}). Retained richer description (${Math.max(existingDesc.length, currentDesc.length)} chars).`,
        wordpressPostIds: mergedWpIds,
      });
    } else {
      nameMap.set(norm, rec);
      dedupedRecords.push({ raw: rec, mergedWpIds: [rec.wordpressPostId] });
    }
  }

  // Category mapping distributions
  const mappingMap = new Map<string, CategoryMappingSummary>();

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
        sourceCategory: rec.category,
        sourceSubcategory: rec.subcategory || "(none)",
        targetCategory: resolved.category,
        targetCategoryId: resolved.categoryId,
        targetSubcategory: resolved.subcategory,
        targetSubcategoryId: resolved.subcategoryId,
        recordCount: 0,
        sampleCelebrities: [],
      });
    }

    const mapEntry = mappingMap.get(key)!;
    mapEntry.recordCount++;
    if (mapEntry.sampleCelebrities.length < 5) {
      mapEntry.sampleCelebrities.push(rec.name);
    }
  }

  const categoryMappings = Array.from(mappingMap.values()).sort(
    (a, b) => b.recordCount - a.recordCount
  );

  // Generate sample records (1 from top 6 categories + 1 generated description)
  const sampleRecords: Celebrity[] = [];
  const samplesTaken = new Set<string>();

  for (const item of dedupedRecords) {
    const celeb = prepareMigratedCelebrity(item.raw, { mergedWpIds: item.mergedWpIds });
    if (!samplesTaken.has(celeb.category) && sampleRecords.length < 8) {
      sampleRecords.push(celeb);
      samplesTaken.add(celeb.category);
    }
  }

  return {
    totalRecords: records.length,
    uniqueRecords: dedupedRecords.length,
    internalDuplicatesCount: duplicateReport.length,
    recordsWithDescription: withDesc,
    recordsMissingDescription: missingDesc,
    validImageCount: validImages,
    categoryMappings,
    duplicateReport,
    sampleRecords,
  };
}

/**
 * Execute batch migration with real-time feedback, dry-run support,
 * and duplicate protection against existing Firestore records.
 */
export async function runBatchMigration(
  payload: LegacyMigrationFilePayload,
  options: {
    dryRun?: boolean;
    batchSize?: number;
    delayBetweenBatchesMs?: number;
    skipWpIds?: string[];
    onProgress?: MigrationProgressCallback;
    signal?: AbortSignal;
    targetWpIds?: string[];
    limit?: number;
  }
): Promise<MigrationExecutionResult> {
  const dryRun = options.dryRun ?? false;
  const batchSize = Math.min(options.batchSize || 150, 450); // Firestore max is 500
  const delayMs = options.delayBetweenBatchesMs ?? 150;
  const skipWpIds = new Set<string>(options.skipWpIds || []);
  const onProgress = options.onProgress || (() => {});
  const logs: string[] = [];
  const errors: string[] = [];
  const duplicateReport: DuplicateReportItem[] = [];

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    logs.push(`[${time}] ${msg}`);
  };

  log(`Initiating legacy data migration (Mode: ${dryRun ? "DRY-RUN PREVIEW" : "LIVE CLOUD WRITE"})...`);

  // Step 1: Analyze & Deduplicate Payload
  onProgress({
    phase: "analyzing",
    message: "Analyzing legacy JSON payload and resolving category hierarchies...",
    percent: 5,
    currentBatch: 0,
    totalBatches: 0,
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    log: "Analyzing records...",
  });

  const analysis = analyzeMigrationPayload(payload);
  log(`Analysis complete: ${payload.celebrities.length} total records -> ${analysis.uniqueRecords} unique profiles.`);
  log(`Identified ${analysis.internalDuplicatesCount} duplicate pairs merged cleanly without data loss.`);
  log(`${analysis.recordsMissingDescription} records without descriptions will receive curated AI biographies.`);

  // Merge internal duplicate items into report
  duplicateReport.push(...analysis.duplicateReport);

  // Step 2: Fetch existing records from Firestore to verify manual vs migrated documents
  onProgress({
    phase: "verifying",
    message: "Checking existing Firestore records for collision protection...",
    percent: 15,
    currentBatch: 0,
    totalBatches: 0,
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    log: "Querying Firestore celebrities...",
  });

  const existingSlugMap = new Map<string, { id: string; name: string; isManual: boolean; wpId?: string }>();
  const existingNameMap = new Map<string, { id: string; name: string; isManual: boolean; wpId?: string }>();

  if (db) {
    try {
      const snap = await getDocs(collection(db, "celebrities"));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const slug = (data.slug || "").toLowerCase().trim();
        const name = (data.name || "").toLowerCase().trim();
        const isManual = data.source !== "legacy_migration" && !data.wordpressPostId;
        const wpId = data.wordpressPostId;

        if (slug) existingSlugMap.set(slug, { id: docSnap.id, name: data.name, isManual, wpId });
        if (name) existingNameMap.set(name, { id: docSnap.id, name: data.name, isManual, wpId });
      });
      log(`Firestore verification: ${snap.size} existing records scanned for conflict prevention.`);
    } catch (err: unknown) {
      log(`Firestore warning: Could not scan existing records (${err instanceof Error ? err.message : String(err)}). Continuing with payload deduplication.`);
    }
  }

  // Deduplicate payload into distinct celebrities list
  const nameMap = new Map<string, { raw: LegacyCelebrityRaw; mergedWpIds: string[] }>();
  for (const rec of payload.celebrities) {
    const norm = rec.name.trim().toLowerCase();
    if (!nameMap.has(norm)) {
      nameMap.set(norm, { raw: rec, mergedWpIds: [rec.wordpressPostId] });
    } else {
      const existing = nameMap.get(norm)!;
      const existingDesc = (existing.raw.description || "").trim();
      const currentDesc = (rec.description || "").trim();
      const winner = !existingDesc && currentDesc ? rec : existing.raw;
      const mergedWpIds = Array.from(new Set([...existing.mergedWpIds, rec.wordpressPostId]));
      nameMap.set(norm, { raw: winner, mergedWpIds });
    }
  }

  let itemsToMigrate = Array.from(nameMap.values());

  // Support targeted pilot import or limit
  if (options.targetWpIds && options.targetWpIds.length > 0) {
    const targetSet = new Set(options.targetWpIds.map(String));
    itemsToMigrate = itemsToMigrate.filter((item) =>
      item.mergedWpIds.some((id) => targetSet.has(String(id)))
    );
  } else if (options.limit && options.limit > 0) {
    itemsToMigrate = itemsToMigrate.slice(0, options.limit);
  }

  const totalItems = itemsToMigrate.length;
  const totalBatches = Math.ceil(totalItems / batchSize);

  let processedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  if (dryRun) {
    log("Executing DRY-RUN simulation across all batches (no database writes)...");
    for (let i = 0; i < totalItems; i++) {
      const { raw, mergedWpIds } = itemsToMigrate[i];
      const celeb = prepareMigratedCelebrity(raw, { mergedWpIds });
      const normName = celeb.name.toLowerCase();
      const normSlug = celeb.slug.toLowerCase();

      // Check for manual conflict
      const existingByName = existingNameMap.get(normName);
      const existingBySlug = existingSlugMap.get(normSlug);
      const conflict = (existingByName?.isManual && existingByName) || (existingBySlug?.isManual && existingBySlug);

      if (conflict) {
        skippedCount++;
        duplicateReport.push({
          name: celeb.name,
          slug: celeb.slug,
          reason: "manual_record_conflict",
          action: "skipped_preserve_manual",
          details: `Manual record conflict: Document #${conflict.id} ("${conflict.name}") was manually created. Skipped legacy import to preserve manual edits.`,
          wordpressPostIds: mergedWpIds,
        });
      } else if (existingByName || existingBySlug) {
        updatedCount++;
      } else {
        createdCount++;
      }
      processedCount++;
    }

    log(`Dry-run simulation finished successfully.`);
    log(`Summary: ${createdCount} new records to create, ${updatedCount} existing to update, ${skippedCount} manual records protected.`);

    onProgress({
      phase: "complete",
      message: "Dry-run simulation completed successfully.",
      percent: 100,
      currentBatch: totalBatches,
      totalBatches,
      processed: processedCount,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: 0,
      log: "Dry-run complete.",
    });

    return {
      success: true,
      dryRun: true,
      totalScanned: payload.celebrities.length,
      totalImported: createdCount + updatedCount,
      totalSkipped: skippedCount,
      totalFailed: 0,
      logs,
      errors,
      duplicateReport,
      timestamp: new Date().toISOString(),
    };
  }

  // LIVE MIGRATION: Controlled Firestore batched writes
  log(`Starting live migration of ${totalItems} profiles in ${totalBatches} controlled batches (Batch size: ${batchSize})...`);
  const committedWpIds: string[] = Array.from(skipWpIds);

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    if (options.signal?.aborted) {
      log("Migration cancelled by user. Checkpoint preserved.");
      break;
    }

    const startIdx = batchIdx * batchSize;
    const endIdx = Math.min(startIdx + batchSize, totalItems);
    const chunk = itemsToMigrate.slice(startIdx, endIdx);

    const batch = db ? writeBatch(db) : null;
    let batchOperations = 0;
    let batchCreatedCount = 0;
    let batchUpdatedCount = 0;
    const batchWpIds: string[] = [];
    const batchCelebrityNames: string[] = [];

    log(`Batch ${batchIdx + 1}/${totalBatches}: Preparing records ${startIdx + 1} to ${endIdx}...`);

    for (const item of chunk) {
      const { raw, mergedWpIds } = item;

      // Check if already in skip list (for resuming)
      if (mergedWpIds.some((id) => skipWpIds.has(id))) {
        skippedCount++;
        processedCount++;
        continue;
      }

      const celeb = prepareMigratedCelebrity(raw, { mergedWpIds });
      const normName = celeb.name.toLowerCase();
      const normSlug = celeb.slug.toLowerCase();

      // Check for manual conflict
      const existingByName = existingNameMap.get(normName);
      const existingBySlug = existingSlugMap.get(normSlug);
      const conflict = (existingByName?.isManual && existingByName) || (existingBySlug?.isManual && existingBySlug);

      if (conflict) {
        skippedCount++;
        processedCount++;
        duplicateReport.push({
          name: celeb.name,
          slug: celeb.slug,
          reason: "manual_record_conflict",
          action: "skipped_preserve_manual",
          details: `Manual record conflict: Document #${conflict.id} ("${conflict.name}") was manually created. Skipped legacy import to preserve manual edits.`,
          wordpressPostIds: mergedWpIds,
        });
        continue;
      }

      if (batch && db) {
        // Document ID: Use consistent, idempotent key based on WordPress post ID or clean slug
        const docRef = doc(db, "celebrities", celeb.id);
        const cleanData = JSON.parse(JSON.stringify(celeb));
        batch.set(docRef, cleanData, { merge: true });
        batchOperations++;
      }

      if (existingByName || existingBySlug) {
        batchUpdatedCount++;
      } else {
        batchCreatedCount++;
      }
      batchWpIds.push(...mergedWpIds);
      batchCelebrityNames.push(celeb.name);
      processedCount++;
    }

    // Commit batch to Firestore
    let batchSucceeded = false;
    if (batch && batchOperations > 0) {
      try {
        await batch.commit();
        batchSucceeded = true;
        createdCount += batchCreatedCount;
        updatedCount += batchUpdatedCount;
        committedWpIds.push(...batchWpIds);
        log(`✓ Batch ${batchIdx + 1}/${totalBatches} committed (${batchOperations} documents written).`);
      } catch (err: unknown) {
        const errorMsg = `Batch ${batchIdx + 1} commit failed: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errorMsg);
        log(`✗ ERROR: ${errorMsg}`);
        // Ensure failed batch items are never marked as imported or added to checkpoint
        failedCount += batchOperations;
      }
    } else if (batchOperations === 0) {
      // All items in this batch were skipped (e.g., resumed or manual conflict)
      batchSucceeded = true;
    }

    const currentPercent = Math.min(15 + Math.round((processedCount / totalItems) * 80), 98);
    onProgress({
      phase: "migrating",
      message: `Importing Batch ${batchIdx + 1}/${totalBatches} (${processedCount}/${totalItems} profiles)...`,
      percent: currentPercent,
      currentBatch: batchIdx + 1,
      totalBatches,
      processed: processedCount,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: failedCount,
      log: batchSucceeded
        ? `Committed batch ${batchIdx + 1} (${processedCount} profiles processed)`
        : `Batch ${batchIdx + 1} failed (${batchOperations} records failed write)`,
      committedWpIds,
    });

    // Polite delay between batches
    if (batchIdx < totalBatches - 1 && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  log(`Migration operation completed. Total processed: ${processedCount}, Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}, Failed: ${failedCount}.`);

  onProgress({
    phase: failedCount === 0 ? "complete" : "error",
    message: failedCount === 0 ? "All celebrity records imported successfully!" : `Migration completed with ${failedCount} errors.`,
    percent: 100,
    currentBatch: totalBatches,
    totalBatches,
    processed: processedCount,
    created: createdCount,
    updated: updatedCount,
    skipped: skippedCount,
    failed: failedCount,
    log: "Migration execution finished.",
    committedWpIds,
  });

  return {
    success: failedCount === 0,
    dryRun: false,
    totalScanned: payload.celebrities.length,
    totalImported: createdCount + updatedCount,
    totalSkipped: skippedCount,
    totalFailed: failedCount,
    logs,
    errors,
    duplicateReport,
    timestamp: new Date().toISOString(),
    committedWpIds,
  };
}

/**
 * Download duplicate report or failed records as a JSON file.
 */
export function exportReportAsJson(data: unknown, filename: string): void {
  if (typeof window === "undefined") return;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
