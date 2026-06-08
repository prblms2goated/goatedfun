import fs from 'fs';

function searchJsonProperties() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Search for the word "JSON" in deobfuscated text
  let idx = content.indexOf('"JSON"');
  if (idx === -1) {
    idx = content.indexOf("'JSON'");
  }

  while (idx !== -1) {
    console.log(`Found "JSON" at ${idx}:`);
    console.log(content.substring(idx - 150, idx + 250));
    idx = content.indexOf('"JSON"', idx + 1);
  }

  // Search for the word "parse" in deobfuscated text
  let pIdx = content.indexOf('"parse"');
  if (pIdx === -1) {
    pIdx = content.indexOf("'parse'");
  }

  while (pIdx !== -1) {
    console.log(`Found "parse" at ${pIdx}:`);
    console.log(content.substring(pIdx - 150, pIdx + 250));
    pIdx = content.indexOf('"parse"', pIdx + 1);
  }
}

searchJsonProperties();
