import fs from 'fs';
import path from 'path';

const data = JSON.parse(fs.readFileSync('celebritybulaye-migration.json', 'utf8'));
const records = data.celebrities;

console.log(`Starting full production-readiness audit of ${records.length} image URLs...`);

const results = {
  total: records.length,
  status200: [],
  redirects: [],
  notFound404: [],
  forbidden403: [],
  errors: [],
};

// Concurrency pool
const CONCURRENCY = 25;
let index = 0;

async function checkSingleUrl(record) {
  const originalUrl = record.imageUrl;
  // Normalize .com to .in if needed
  const testUrl = originalUrl.replace('www.celebritybulaye.com', 'celebritybulaye.in');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(testUrl, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    clearTimeout(timer);

    const isRedirect = res.status >= 300 && res.status < 400;
    const location = isRedirect ? res.headers.get('location') : null;

    if (res.status === 200) {
      results.status200.push({ name: record.name, wpId: record.wordpressPostId, url: originalUrl, testUrl });
    } else if (isRedirect) {
      results.redirects.push({ name: record.name, wpId: record.wordpressPostId, status: res.status, url: originalUrl, redirectLocation: location });
    } else if (res.status === 404) {
      results.notFound404.push({ name: record.name, wpId: record.wordpressPostId, url: originalUrl, testUrl });
    } else if (res.status === 403) {
      results.forbidden403.push({ name: record.name, wpId: record.wordpressPostId, url: originalUrl });
    } else {
      results.errors.push({ name: record.name, wpId: record.wordpressPostId, status: res.status, url: originalUrl });
    }
  } catch (err) {
    clearTimeout(timer);
    results.errors.push({
      name: record.name,
      wpId: record.wordpressPostId,
      url: originalUrl,
      error: err.name === 'AbortError' ? 'TIMEOUT' : (err.cause?.code || err.message)
    });
  }
}

async function worker() {
  while (index < records.length) {
    const currentIndex = index++;
    await checkSingleUrl(records[currentIndex]);
    if (currentIndex % 150 === 0 || currentIndex === records.length - 1) {
      process.stdout.write(`Checked ${currentIndex + 1}/${records.length} images... (200 OK: ${results.status200.length}, 404: ${results.notFound404.length}, Redirects: ${results.redirects.length}, Errors: ${results.errors.length})\r`);
    }
  }
}

const workers = Array.from({ length: CONCURRENCY }, () => worker());
await Promise.all(workers);

console.log('\n\n=================================================================');
console.log('                 IMAGE URL AUDIT RESULTS                         ');
console.log('=================================================================');
console.log(`Total URLs Audited:            ${results.total}`);
console.log(`Directly Valid (HTTP 200 OK):  ${results.status200.length} (${((results.status200.length/results.total)*100).toFixed(1)}%)`);
console.log(`Redirecting URLs (HTTP 3xx):   ${results.redirects.length}`);
console.log(`Not Found (HTTP 404):          ${results.notFound404.length}`);
console.log(`Forbidden (HTTP 403):          ${results.forbidden403.length}`);
console.log(`Errors / Timeouts / Unreach:   ${results.errors.length}`);
console.log('=================================================================');

if (results.notFound404.length > 0) {
  console.log('\nSample 404 Not Found URLs:');
  console.table(results.notFound404.slice(0, 10));
}

if (results.redirects.length > 0) {
  console.log('\nSample Redirects:');
  console.table(results.redirects.slice(0, 5));
}

if (results.errors.length > 0) {
  console.log('\nSample Errors:');
  console.table(results.errors.slice(0, 10));
}

fs.writeFileSync(
  path.resolve(process.cwd(), 'image-audit-report.json'),
  JSON.stringify(results, null, 2),
  'utf-8'
);
console.log('\n✓ Saved complete report to image-audit-report.json');

