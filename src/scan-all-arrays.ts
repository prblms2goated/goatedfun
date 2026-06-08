import fs from 'fs';

function scanAllAppsArrays() {
  const content = fs.readFileSync('deobfuscated_file.js', 'utf-8');

  // Let's resolve string concatenations inside the entire file so regex matches perfectly
  let merged = content;
  let lenBefore = 0;
  while (merged.length !== lenBefore) {
    lenBefore = merged.length;
    merged = merged.replace(/"\s*\+\s*"/g, '');
    merged = merged.replace(/'\s*\+\s*'/g, '');
    merged = merged.replace(/"\s*\+\s*'/g, '"');
    merged = merged.replace(/'\s*\+\s*"/g, "'");
    merged = merged.replace(/`\s*\+\s*`/g, '');
  }

  console.log('Searching for array variable definitions containing "appName"...');

  // Let's find any structure that begins with an array declaration with objects containing appName
  // E.g. \w+\s*=\s*\[\s*\{\s*["']appName["']\s*:
  // Or loosely: any array containing objects with appName
  // Let's write a parser that scans the file for "{ ... appName ... }" blocks and prints or parses them.
  // We can scan for any segment that contains "{'appName':" or '{"appName":' or '{appName:' and matches braces.
  
  // Let's write a simple pattern finder
  const objList: any[] = [];
  
  // RegExp to find individual objects that have appName, desc, icon/img/thumbnail, and url/iframeUrl
  // Let's use a capture group for keys and values since they might be in any quote style
  // Keys can be "appName", 'appName', appName (no quotes), or "title", 'title', title, etc.
  // Let's look for: "appName" or 'appName'
  const appMatchRegex = /\{[^{}]*?["']?appName["']?\s*:\s*([^,{}]+)[\s\S]*?\}/g;
  
  // Let's do a very target-oriented search:
  // Split merged text by "appName" or similar, and grab the surrounding object.
  // Actually, we can write a parser that scans the character stream. Whenever we see "appName", we find the start '{' of that object
  // and match the closing '}' of that object. Then we extract its properties!
  
  let pos = 0;
  const gameRecords: any[] = [];
  
  while (true) {
    const idx = merged.indexOf('appName', pos);
    if (idx === -1) break;
    
    // Find back to the starting '{'
    let startIdx = idx;
    let bracesCount = 0;
    while (startIdx >= 0) {
      if (merged[startIdx] === '{') {
        break;
      }
      startIdx--;
    }
    
    if (startIdx >= 0) {
      // Find the matching '}' of this object, taking quotes into account
      let openBraces = 0;
      let insideSingle = false;
      let insideDouble = false;
      let escape = false;
      let objText = '';
      
      for (let i = startIdx; i < merged.length; i++) {
        const char = merged[i];
        objText += char;
        
        if (escape) {
          escape = false;
          continue;
        }
        if (char === '\\') {
          escape = true;
          continue;
        }
        if (char === "'" && !insideDouble) {
          insideSingle = !insideSingle;
          continue;
        }
        if (char === '"' && !insideSingle) {
          insideDouble = !insideDouble;
          continue;
        }
        
        if (!insideSingle && !insideDouble) {
          if (char === '{') {
            openBraces++;
          } else if (char === '}') {
            openBraces--;
            if (openBraces === 0) {
              break;
            }
          }
        }
      }
      
      // Now parse properties from this object text
      // We can use simple helper regexes to get appName, desc, icon, and url
      const nameMatch = objText.match(/["']?appName["']?\s*:\s*["']([^"']+)["']/i);
      const descMatch = objText.match(/["']?desc["']?\s*:\s*["']([^"']+)["']/i);
      const iconMatch = objText.match(/["']?icon["']?\s*:\s*["']([^"']+)["']/i);
      const urlMatch = objText.match(/["']?url["']?\s*:\s*["']([^"']+)["']/i);
      
      if (nameMatch && urlMatch) {
        const name = nameMatch[1];
        const url = urlMatch[1];
        const desc = descMatch ? descMatch[1] : '';
        const icon = iconMatch ? iconMatch[1] : '';
        
        gameRecords.push({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: name,
          category: desc || 'Classics',
          description: desc || `Play ${name} unblocked on Goated Fun.`,
          instructions: `Launch ${name} and follow in-game tutorials. Standard keyboard or mouse controls apply.`,
          iframeUrl: url,
          thumbnailUrl: icon || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop",
          rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
          tags: [desc.toLowerCase().replace(/[^a-z]+/g, ''), "unblocked", "retro"]
        });
      }
    }
    
    pos = idx + 7;
  }
  
  // Deduplicate by iframeUrl or title
  const deduplicated: any[] = [];
  const seenUrls = new Set<string>();
  for (const game of gameRecords) {
    if (!seenUrls.has(game.iframeUrl)) {
      seenUrls.add(game.iframeUrl);
      deduplicated.push(game);
    }
  }

  console.log(`Successfully extracted ${deduplicated.length} unique app/game definitions!`);
  fs.writeFileSync('extracted_unblocked_games.json', JSON.stringify(deduplicated, null, 2));
  console.log('Written to extracted_unblocked_games.json');
}

scanAllAppsArrays();
