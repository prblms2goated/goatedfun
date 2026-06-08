import fs from 'fs';

function scanEdx() {
  const content = fs.readFileSync('probe_js__chunks_EDxVzbrr.js', 'utf-8');

  console.log('--- Scanning probe_js__chunks_EDxVzbrr.js ---');
  console.log('File size:', content.length);

  const keywords = ["appName", "Drift Boss", "Slope", "1v1", "JSON.parse", ".parse", "Retro Bowl"];
  for (const k of keywords) {
    const idx = content.indexOf(k);
    if (idx !== -1) {
      console.log(`Found keyword "${k}" at character index ${idx}:`);
      console.log(content.substring(idx - 150, idx + 250));
    } else {
      // Try case insensitive
      const idxLower = content.toLowerCase().indexOf(k.toLowerCase());
      if (idxLower !== -1) {
        console.log(`Found keyword "${k}" (case-insensitive) at character index ${idxLower}:`);
        console.log(content.substring(idxLower - 150, idxLower + 250));
      }
    }
  }
}

scanEdx();
