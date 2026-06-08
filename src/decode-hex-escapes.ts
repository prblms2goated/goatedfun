import fs from 'fs';

function decodeHexEscapesAndMerge() {
  const fileContent = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Let's replace the literal letters \\x22, \\x27, etc.
  // Wait, in Javascript strings, are they represented as double backslashes like "\\x22" or active escapes?
  // Since we read the file using utf-8, they will be literal slash, x, 2, 2. Let's replace both active and literal patterns!
  let decoded = fileContent
    .replace(/\\x22/g, '"')
    .replace(/\\x27/g, "'")
    .replace(/\\x20/g, ' ')
    .replace(/\\x2f/g, '/')
    .replace(/\\x3a/g, ':')
    .replace(/\\x2c/g, ',')
    .replace(/\\x7b/g, '{')
    .replace(/\\x7d/g, '}');

  // Now, let's normalize quote formatting character-by-character to eliminate quote mismatches
  let result = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  let currentString = '';

  for (let i = 0; i < decoded.length; i++) {
    const char = decoded[i];

    if (escape) {
      currentString += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
      currentString += char;
      escape = true;
      continue;
    }

    if (char === "'") {
      if (inDouble) {
        currentString += char;
      } else {
        inSingle = !inSingle;
        if (!inSingle) {
          const normalizedStr = currentString.replace(/"/g, '\\"');
          result += `"${normalizedStr}"`;
          currentString = '';
        }
      }
      continue;
    }

    if (char === '"') {
      if (inSingle) {
        currentString += char;
      } else {
        inDouble = !inDouble;
        result += char;
      }
      continue;
    }

    if (inSingle) {
      currentString += char;
    } else {
      result += char;
    }
  }

  // Merge double quotes
  let merged = result;
  let lenBefore = 0;
  while (merged.length !== lenBefore) {
    lenBefore = merged.length;
    merged = merged.replace(/"\s*\+\s*"/g, '');
  }

  fs.writeFileSync('clean_merged_PRwL-Vol.js', merged, 'utf-8');
  console.log('Successfully wrote clean_merged_PRwL-Vol.js!');

  // Let's print the text around the keyword "Drift Boss"
  const idx = merged.indexOf('Drift Boss');
  if (idx !== -1) {
    console.log('--- Context of Drift Boss ---');
    console.log(merged.substring(idx - 100, idx + 500));
  } else {
    console.log('Could not find Drift Boss in merged text.');
  }
}

decodeHexEscapesAndMerge();
