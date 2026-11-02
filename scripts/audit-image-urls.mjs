import fs from 'fs';

const data = JSON.parse(fs.readFileSync('celebritybulaye-migration.json', 'utf8'));
const records = data.celebrities;

console.log(`Auditing ${records.length} image URLs...`);

async function checkUrl(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Try HEAD first
    let res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    // If method not allowed (405) or bad request (400), try range GET
    if (res.status === 405 || res.status === 400) {
      res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Range': 'bytes=0-10'
        }
      });
    }

    clearTimeout(timer);

    const isRedirect = res.status >= 300 && res.status < 400;
    const location = isRedirect ? res.headers.get('location') : null;

    return {
      status: res.status,
      ok: res.ok || (res.status >= 200 && res.status < 300),
      isRedirect,
      redirectLocation: location,
      contentType: res.headers.get('content-type'),
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      status: 0,
      ok: false,
      error: err.name === 'AbortError' ? 'TIMEOUT' : (err.cause?.code || err.message),
    };
  }
}

// Test sample 10 first
console.log('Testing sample 5 URLs:');
for (let i = 0; i < 5; i++) {
  const r = records[i];
  const res = await checkUrl(r.imageUrl);
  console.log(`[${i+1}] ${r.name}: ${r.imageUrl}`);
  console.log(`    Status: ${res.status}, OK: ${res.ok}, Redirect: ${res.isRedirect} (${res.redirectLocation}), Error: ${res.error || 'none'}, Type: ${res.contentType}`);
}

