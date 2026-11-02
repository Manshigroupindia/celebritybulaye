import fs from "fs";
import path from "path";

const scriptContent = fs.readFileSync(path.resolve(process.cwd(), "scripts/migrate-legacy.mjs"), "utf8");

// Extract SYSTEM_CATEGORIES, formatResolved, resolveLegacyCategory
const sysCatMatch = scriptContent.match(/const SYSTEM_CATEGORIES = \{[\s\S]*?\n\};/);
const formatResMatch = scriptContent.match(/function formatResolved\(catId, subId\) \{[\s\S]*?\n\}/);
const resolveCatMatch = scriptContent.match(/function resolveLegacyCategory\(record\) \{[\s\S]*?\n\}/);

const fnBlock = `${sysCatMatch[0]}\n${formatResMatch[0]}\n${resolveCatMatch[0]}`;
const ctx = new Function(fnBlock + "\nreturn { SYSTEM_CATEGORIES, resolveLegacyCategory };")();

const { SYSTEM_CATEGORIES, resolveLegacyCategory } = ctx;

const jsonPath = path.resolve(process.cwd(), "celebritybulaye-migration.json");
const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Deduplicate
const nameMap = new Map();
const deduped = [];
for (const c of payload.celebrities) {
  const norm = c.name.trim().toLowerCase();
  if (!nameMap.has(norm)) {
    nameMap.set(norm, c);
    deduped.push(c);
  } else {
    const existing = nameMap.get(norm);
    const existingDesc = (existing.description || "").trim();
    const currentDesc = (c.description || "").trim();
    if (!existingDesc && currentDesc) {
      nameMap.set(norm, c);
      const idx = deduped.findIndex((x) => x.name.trim().toLowerCase() === norm);
      deduped[idx] = c;
    }
  }
}

console.log("Total unique records:", deduped.length);

let validMappings = 0;
let invalidMappings = 0;
const catCounts = {};
const subcatCounts = {};

for (const c of deduped) {
  const mapping = resolveLegacyCategory(c);
  const catObj = SYSTEM_CATEGORIES[mapping.categoryId];
  if (!catObj) {
    console.error("INVALID CATEGORY:", mapping.categoryId, "for", c.name);
    invalidMappings++;
    continue;
  }
  const subObj = catObj.subcategories[mapping.subcategoryId];
  if (!subObj) {
    console.error("INVALID SUBCATEGORY:", mapping.subcategoryId, "under", mapping.categoryId, "for", c.name);
    invalidMappings++;
    continue;
  }
  validMappings++;
  catCounts[catObj.name] = (catCounts[catObj.name] || 0) + 1;
  const fullSubKey = `${catObj.name} > ${subObj.name}`;
  subcatCounts[fullSubKey] = (subcatCounts[fullSubKey] || 0) + 1;
}

console.log(`Valid mappings: ${validMappings} / ${deduped.length}`);
console.log(`Invalid mappings: ${invalidMappings}`);

console.log("\n--- Category Breakdown ---");
let totalCat = 0;
for (const [cat, cnt] of Object.entries(catCounts)) {
  console.log(`${cat.padEnd(20)}: ${cnt}`);
  totalCat += cnt;
}
console.log(`Total across all categories: ${totalCat}`);

console.log("\n--- Subcategory Breakdown ---");
let totalSub = 0;
for (const [sub, cnt] of Object.entries(subcatCounts)) {
  console.log(`  ${sub.padEnd(38)}: ${cnt}`);
  totalSub += cnt;
}
console.log(`Total across all subcategories: ${totalSub}`);
