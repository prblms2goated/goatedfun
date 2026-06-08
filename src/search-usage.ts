import fs from 'fs';

function searchUsage() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Let's find index of "[{\"appName"
  let idx = content.indexOf('[{"appName');
  if (idx === -1) {
    idx = content.indexOf('{"appName');
  }

  if (idx !== -1) {
    console.log(`Found string pattern at position ${idx}`);
    console.log('--- Context ---');
    console.log(content.substring(idx - 100, idx + 1500));
  } else {
    console.log('Not found in deobfuscated_PRwL-Vol.js directly. Let us search case-insensitively or check other segments.');
  }
}

searchUsage();
