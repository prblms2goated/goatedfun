import fs from 'fs';

function extractTeArray() {
  const content = fs.readFileSync('deobfuscated_file.js', 'utf-8');

  // Let's find index of "te=[" in deobfuscated_file.js
  const teIndex = content.indexOf('te=[');
  if (teIndex === -1) {
    console.log('Could not find te=[');
    // Let's search loosely for any series of objects like:
    // appName: '...', or appName: "..."
    return;
  }

  console.log('Found te=[ at character index', teIndex);
  
  // Let's grab a block of text from teIndex
  // and output it. The te array can contain several thousands characters because it lists apps/games.
  // Let's use bracket matching to find the end of the te array!
  let openBraces = 0;
  let teBody = '';
  let started = false;
  for (let i = teIndex; i < content.length; i++) {
    const char = content[i];
    teBody += char;
    if (char === '[') {
      openBraces++;
      started = true;
    } else if (char === ']') {
      openBraces--;
      if (started && openBraces === 0) {
        break;
      }
    }
  }

  console.log(`Extracted te array of length: ${teBody.length}`);
  fs.writeFileSync('te_array_raw.js', teBody, 'utf-8');
}

extractTeArray();
