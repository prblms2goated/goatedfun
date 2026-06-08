import fs from 'fs';

function findKeyword() {
  const content = fs.readFileSync('deobfuscated_file.js', 'utf-8');
  
  const keywords = ["Basket", "Bros", "basket", "bros", "basketball", "tennis", "soccer", "retro", "bowl"];
  for (const k of keywords) {
    const idx = content.indexOf(k);
    if (idx !== -1) {
      console.log(`Found "${k}" at ${idx}:`);
      console.log(content.substring(idx - 100, idx + 400));
      break;
    }
  }
}

findKeyword();
