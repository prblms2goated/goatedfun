import fs from 'fs';

function extractData() {
  const files = [
    'probe_js__chunks_EDxVzbrr.js',
    'probe_js__chunks_PRwL-Vol.js',
    'probe_js__chunks__5I2IFR9.js'
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;

    console.log(`\n================= Processing ${file} =================`);
    const content = fs.readFileSync(file, 'utf-8');

    // 1. Look for unblocked url strings, e.g. .html, github.io/assets, cloudflare, hello4.sulevkivastik.ee
    // Let's search for "https://" or "http://" sequences that look like games or iframe embeds.
    const urlPattern = /https?:\/\/[^\s"'`>]+?(?:\.html|\.js|\/g\/|\/assets\/|\/game\/|\/unblocked\/)/gi;
    const matches = content.match(urlPattern) || [];
    console.log(`Found ${matches.length} matches of game-like URL patterns.`);
    const uniqueUrls = Array.from(new Set(matches)).slice(0, 15);
    console.log('Sample URLs:', uniqueUrls);

    // Let's search for JSON-like array structures containing "title" "iframe" "id" etc.
    // Sometimes they are declared as large arrays of objects: [{id:"...",title:"...",url:"..."}]
    // Let's regex search for text like: id\s*:\s*["'][a-zA-Z0-0_-]+["']\s*,\s*title\s*:
    const rawMatches = content.match(/id\s*:\s*["'][^"']+?["']\s*,\s*title\s*:\s*["'][^"']+?["']/gi) || [];
    console.log(`Found ${rawMatches.length} raw id/title matching pairs.`);
    if (rawMatches.length > 0) {
      console.log('Sample ID/Title pairs:', rawMatches.slice(0, 5));
    }

    // Let's find index offsets of game titles we might identify, like "BasketBros" or "Retro Bowl" or "Tomb of the Mask"
    const knownKeys = ["BasketBros", "Retro Bowl", "Minecraft", "Slope", "1v1", "Tunnel Rush", "geometry-dash"];
    for (const key of knownKeys) {
      const idx = content.toLowerCase().indexOf(key.toLowerCase());
      if (idx !== -1) {
        console.log(`Found known keyword "${key}" at index ${idx}.`);
        // Let's print a small context window Around this keyword
        console.log(`Context: ${content.substring(Math.max(0, idx - 150), Math.min(content.length, idx + 400))}\n`);
      }
    }
  }
}

extractData();
