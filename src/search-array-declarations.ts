import fs from 'fs';

function findArrays() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Let's search for patterns of variable = [
  // E.g. const xx = [, or let xx = [, or var xx = [
  // where the array is declared.
  const regex = /(?:const|let|var)?\s*([a-zA-Z0-9_$]+)\s*=\s*\[/g;
  let match;
  const matches = [];
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  console.log('All array variable names found in deobfuscated_PRwL-Vol.js:', Array.from(new Set(matches)));

  // Let's print sections for these variable array declarations
  for (const name of Array.from(new Set(matches))) {
    const idx = content.indexOf(`${name}=[` );
    const idxSpaces = content.indexOf(`${name} = [` );
    const actualIdx = idx !== -1 ? idx : idxSpaces;
    
    if (actualIdx !== -1) {
      console.log(`\n--- Array ${name} (Index: ${actualIdx}) ---`);
      console.log(content.substring(actualIdx, actualIdx + 300));
    }
  }
}

findArrays();
