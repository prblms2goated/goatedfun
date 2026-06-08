import fs from 'fs';

function testNormalize() {
  const fileContent = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Let's normalize quotes carefully.
  // Instead of a complex regex parser which can sometimes break on code, let's write a character-by-character scanner
  // that converts all single quotes to double quotes in the entire file!
  // It will scan the file and when it is inside a single-quoted string, it will collect characters, escape any double-quotes inside it,
  // and output it as a double-quoted string!
  
  let result = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  let currentString = '';

  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent[i];

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
          // End of single-quoted string. Build double-quoted string!
          // Escape any unescaped double quotes inside currentString
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
        if (inDouble) {
          // Start of double-quoted string.
          // Wait, we just keep it as is.
          result += char;
        } else {
          // End of double-quoted string.
          result += char;
        }
      }
      continue;
    }

    if (inSingle) {
      currentString += char;
    } else {
      result += char;
    }
  }

  // Now, all single-quoted strings are guaranteed to be double-quoted strings!
  // Let's verify and run the double-quote merge.
  let merged = result;
  let lenBefore = 0;
  while (merged.length !== lenBefore) {
    lenBefore = merged.length;
    merged = merged.replace(/"\s*\+\s*"/g, '');
  }

  console.log('Successfully completed character-by-character normalization!');
  
  // Let's test if "9anime" is now fully merged
  // Look for "9anime" in normalized/merged text
  const animeIdx = merged.indexOf('9anime');
  if (animeIdx !== -1) {
    console.log('Found 9anime context:');
    console.log(merged.substring(animeIdx, animeIdx + 400));
  }

  fs.writeFileSync('normalized_PRwL-Vol.js', merged, 'utf-8');
}

testNormalize();
