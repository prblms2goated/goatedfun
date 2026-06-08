import fs from 'fs';

function debugMerged() {
  const content = fs.readFileSync('deobfuscated_file.js', 'utf-8');

  // Perform clean/merge
  let merged = content;
  let lenBefore = 0;
  while (merged.length !== lenBefore) {
    lenBefore = merged.length;
    merged = merged.replace(/"\s*\+\s*"/g, '');
    merged = merged.replace(/'\s*\+\s*'/g, '');
    merged = merged.replace(/"\s*\+\s*'/g, '"');
    merged = merged.replace(/'\s*\+\s*"/g, "'");
    merged = merged.replace(/`\s*\+\s*`/g, '');
  }

  // Find all indices of "appName"
  const indices: number[] = [];
  let idx = merged.indexOf('appName');
  while (idx !== -1) {
    indices.push(idx);
    idx = merged.indexOf('appName', idx + 1);
  }

  console.log(`Found "appName" ${indices.length} times in merged text.`);
  
  // Print some contexts
  for (let i = 0; i < Math.min(10, indices.length); i++) {
    const position = indices[i];
    console.log(`\n--- Match ${i + 1} (Index: ${position}) ---`);
    console.log(merged.substring(position - 20, position + 300));
  }
}

debugMerged();
