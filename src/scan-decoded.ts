import fs from 'fs';

// Load our evaluated decrypter helper
import './robust-deobfuscator'; // ensures temp_eval.js exists
import { execSync } from 'child_process';

async function scan() {
  // First make sure temp_eval.js is updated
  // We can just load it
  const evalContent = fs.readFileSync('temp_eval.js', 'utf-8');
  eval(evalContent);

  const mainJS = fs.readFileSync('probe_js__chunks_PRwL-Vol.js', 'utf-8');
  
  // Find all hex value strings
  const regex = /0x[0-9a-fA-F]+/g;
  const matches = mainJS.match(regex) || [];
  const uniqueHex = Array.from(new Set(matches));

  const decodedMap: Record<string, string> = {};
  for (const hex of uniqueHex) {
    decodedMap[hex] = (global as any).decodeString(parseInt(hex, 16));
  }

  // Write all decoded mappings
  fs.writeFileSync('decoded_map.json', JSON.stringify(decodedMap, null, 2));
  console.log(`Decoded ${uniqueHex.length} unique hex keys to decoded_map.json`);

  // Let's print reverse mapping for interesting keys
  const interestingKeys = ["title", "iframeUrl", "url", "category", "description", "desc", "thumbnailUrl", "img", "id", "games"];
  console.log('--- Interesting key mapping ---');
  for (const key of interestingKeys) {
    const hexes = Object.keys(decodedMap).filter(h => decodedMap[h] === key);
    if (hexes.length > 0) {
      console.log(`Value "${key}" is decoded from hex keys:`, hexes);
    }
  }
}

scan();
