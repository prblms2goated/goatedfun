import fs from 'fs';

function cleanAndExtract() {
  const content = fs.readFileSync('deobfuscated_file.js', 'utf-8');

  // Let's write a script to resolve string concatenation in JS
  // Specifically, patterns like: 'foo' + "bar" or "foo" + 'bar' or "foo" + "bar" or 'foo' + 'bar'
  // Or even simpler: let's replace all occurrences of:
  // " + "
  // ' + '
  // " + '
  // ' + "
  // with empty or just merge them.
  // Wait, let's do a more robust string literal merger!
  // We can write a parser that scans the file, resolves all '+' between strings, and cleans escaped characters.
  
  // A simple way to merge concatenated string literals in the entire file:
  let merged = content;
  
  // Replace: "string" + "string" -> "combined"
  // Replace: 'string' + 'string' -> 'combined'
  // Let's do this iteratively until no more merges occur.
  let lenBefore = 0;
  while (merged.length !== lenBefore) {
    lenBefore = merged.length;
    merged = merged.replace(/"\s*\+\s*"/g, '');
    merged = merged.replace(/'\s*\+\s*'/g, '');
    merged = merged.replace(/"\s*\+\s*'/g, '"');
    merged = merged.replace(/'\s*\+\s*"/g, "'");
    // Also handle templates if any
    merged = merged.replace(/`\s*\+\s*`/g, '');
  }

  console.log('After merging string concatenations, let\'s search for all JSON objects!');

  // Now let's search for patterns like {"appName":"...", "desc":"...", "icon":"...", "url":"..."}
  // Let's use a regex to match these blocks.
  // The structure matches: "appName":"(.*?)","desc":"(.*?)","icon":"(.*?)","url":"(.*?)"
  // Let's find matches. Note that keys or values can have either double or single quotes.
  // Let's search inside the merged text for any occurrences of "appName" or 'appName'
  const appNameRegex = /(?:["']appName["']\s*:\s*["']([^"']+)["']\s*,\s*["']desc["']\s*:\s*["']([^"']+)["']\s*,\s*["']icon["']\s*:\s*["']([^"']+)["']\s*,\s*["']url["']\s*:\s*["']([^"']+)["'])/gi;
  
  const gamesList: any[] = [];
  let match;
  while ((match = appNameRegex.exec(merged)) !== null) {
    gamesList.push({
      title: match[1],
      category: match[2],
      thumbnailUrl: match[3],
      iframeUrl: match[4]
    });
  }

  console.log(`Extracted ${gamesList.length} games using appNameRegex!`);
  
  // Let's print the first few
  if (gamesList.length > 0) {
    console.log('Sample games:', gamesList.slice(0, 5));
    fs.writeFileSync('extracted_games.json', JSON.stringify(gamesList, null, 2));
  } else {
    // If no direct matches, let's look for any appName definitions more loosely
    const looseRegex = /appName["']?\s*:\s*["']([^"']+)["']/gi;
    const foundNames = [];
    let looseMatch;
    while ((looseMatch = looseRegex.exec(merged)) !== null) {
      foundNames.push(looseMatch[1]);
    }
    console.log(`Loose appName search found ${foundNames.length} games. First 10:`, foundNames.slice(0, 10));
  }
}

cleanAndExtract();
