import fs from 'fs';

function findKeys() {
  const content = fs.readFileSync('deobfuscated_file.js', 'utf-8');

  // Let's search for some of the keys we saw:
  // "Name":"1v1" or similar
  const keywords = ["1v1", "Bloons", "Slope", "Vex", "Ragdoll"];
  for (const key of keywords) {
    const idx = content.indexOf(key);
    if (idx !== -1) {
      console.log(`\nFound "${key}" at Index ${idx}:`);
      console.log(content.substring(idx - 150, idx + 250));
    }
  }
}

findKeys();
