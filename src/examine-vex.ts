import fs from 'fs';

function examineVex() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  const idx = content.indexOf('Vex ');
  if (idx !== -1) {
    console.log(`Found "Vex " at ${idx}:`);
    console.log(content.substring(idx - 300, idx + 400));
  } else {
    console.log('"Vex " not found');
  }
}

examineVex();
