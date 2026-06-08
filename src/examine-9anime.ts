import fs from 'fs';

function examine9anime() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Find index of "9ani"
  const idx = content.indexOf('9ani');
  if (idx !== -1) {
    console.log(`Found "9ani" at ${idx}:`);
    console.log(content.substring(idx - 150, idx + 250));
  } else {
    console.log('"9ani" not found');
  }
}

examine9anime();
