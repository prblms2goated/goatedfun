import fs from 'fs';

function findJsonParse() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Find occurrences of JSON.parse or .parse
  let idx = content.indexOf('JSON.parse');
  while (idx !== -1) {
    console.log(`Found JSON.parse at index ${idx}:`);
    console.log(content.substring(idx - 150, idx + 250));
    idx = content.indexOf('JSON.parse', idx + 1);
  }

  // Also do case insensitive or look for .parse(
  let parseIdx = content.indexOf('.parse(');
  while (parseIdx !== -1) {
    console.log(`Found .parse( at index ${parseIdx}:`);
    console.log(content.substring(parseIdx - 150, parseIdx + 250));
    parseIdx = content.indexOf('.parse(', parseIdx + 1);
  }
}

findJsonParse();
