import fs from 'fs';

function locateGamesBlock() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Let's search for keywords in the file
  const key = 'Vex';
  const idx = content.indexOf(key);
  if (idx === -1) {
    console.log('Vex not found');
    return;
  }

  console.log(`Found "Vex" at ${idx}. Let us look backwards for variable assignments or decrypter function block.`);
  
  // Let's print 2000 characters before and 2000 characters after
  const start = Math.max(0, idx - 4000);
  const end = Math.min(content.length, idx + 4000);
  
  fs.writeFileSync('vex_context.js', content.substring(start, end));
  console.log('Wrote vex_context.js.');
}

locateGamesBlock();
