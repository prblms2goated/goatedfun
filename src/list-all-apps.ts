import fs from 'fs';

function extractPreciseGames() {
  const merged = fs.readFileSync('normalized_PRwL-Vol.js', 'utf-8');

  console.log('Running robust, quote-flexible bracket crawler...');
  
  const games: any[] = [];
  const seenUrls = new Set<string>();

  // Let's find all `{` and extract their exact matching blocks
  let i = 0;
  while (i < merged.length) {
    if (merged[i] === '{') {
      let openCount = 0;
      let insideS = false;
      let insideD = false;
      let escape = false;
      let block = '';
      let j = i;

      for (; j < merged.length; j++) {
        const c = merged[j];
        block += c;

        if (escape) {
          escape = false;
          continue;
        }
        if (charIsEscape(c)) {
          escape = true;
          continue;
        }
        if (c === "'" && !insideD) {
          insideS = !insideS;
          continue;
        }
        if (c === '"' && !insideS) {
          insideD = !insideD;
          resultAndResetDouble();
          continue;
        }

        if (!insideS && !insideD) {
          if (c === '{') openCount++;
          else if (c === '}') {
            openCount--;
            if (openCount === 0) {
              break;
            }
          }
        }
      }

      function charIsEscape(c: string) { return c === '\\'; }
      function resultAndResetDouble() {}

      i = j + 1;

      // Check if this block defines an appName (with or without quotes)
      if (block.includes('appName')) {
        let cleanBlock = block
          .replace(/\\x22/g, '"')
          .replace(/\\x27/g, "'")
          .replace(/\\x20/g, ' ')
          .replace(/\\x2f/g, '/');

        // Regex that is highly flexible on keys ("appName", 'appName', appName)
        // and quotes around values ("value", 'value')
        const nameM = cleanBlock.match(/["']?appName["']?\s*:\s*["']([^"']+)["']/i);
        const urlM = cleanBlock.match(/["']?url["']?\s*:\s*["']([^"']+)["']/i);
        const descM = cleanBlock.match(/["']?desc["']?\s*:\s*["']([^"']+)["']/i);
        const iconM = cleanBlock.match(/["']?icon["']?\s*:\s*["']([^"']+)["']/i);

        if (nameM && urlM) {
          const name = nameM[1].trim();
          const url = urlM[1].trim();
          const desc = descM ? descM[1].trim() : 'Classic';
          const icon = iconM ? iconM[1].trim() : '';

          const lowerUrl = url.toLowerCase();
          const isNotSocial = !lowerUrl.includes('pinterest.com') && 
                              !lowerUrl.includes('google.com') && 
                              !lowerUrl.includes('amazon.com') && 
                              !lowerUrl.includes('bing.com') &&
                              !lowerUrl.includes('outlook.live') &&
                              !lowerUrl.includes('wikipedia.org') &&
                              !lowerUrl.includes('instagram.com') &&
                              !lowerUrl.includes('netflix.com') &&
                              !lowerUrl.includes('github.com') &&
                              !lowerUrl.includes('gmail') &&
                              !lowerUrl.includes('twitch.tv') &&
                              !lowerUrl.includes('9animetv') &&
                              !lowerUrl.includes('geforcenow.com') &&
                              !lowerUrl.includes('cineby.gd') &&
                              !lowerUrl.includes('discord.com') &&
                              !lowerUrl.includes('weather') &&
                              !lowerUrl.includes('spotify.com');

          // We ignore general basic tools/proxies like Amazon, Youtube etc. if we want only unblocked games,
          // but wait, let's keep all high-quality platforms but filter out obvious social shortcuts.
          if (!seenUrls.has(url) && url !== '#' && isNotSocial && name !== 'App name') {
            seenUrls.add(url);

            let category = 'Arcade';
            let instructions = 'Use standard keyboard (WASD / Arrows) and mouse elements to play.';
            
            const lowerName = name.toLowerCase();
            const lowerDesc = desc.toLowerCase();

            if (lowerName.includes('moto') || lowerName.includes('drive') || lowerName.includes('drift') || lowerName.includes('car') || lowerName.includes('rider') || lowerName.includes('subway') || lowerName.includes('run') || lowerDesc.includes('racing') || lowerDesc.includes('car')) {
              category = 'Racing / Action';
              instructions = 'Accelerate with W or Up Arrow. Steer left/right with A/D or Left/Right Arrows. Use Space or Shift for active action dunks or speed boosts.';
            } else if (lowerName.includes('sport') || lowerName.includes('basket') || lowerName.includes('soccer') || lowerName.includes('ball') || lowerName.includes('tennis') || lowerDesc.includes('sport')) {
              category = 'Sports';
              instructions = 'Guides movement with Arrow keys or W-A-S-D. Press Space, Shift, or specific keys to execute dunks, block, or score.';
            } else if (lowerName.includes('shooter') || lowerName.includes('gun') || lowerName.includes('sniper') || lowerName.includes('combat') || lowerName.includes('1v1') || lowerDesc.includes('shooter')) {
              category = 'Shooter';
              instructions = 'Use standard shooting controls: Mouse to aim, Left Click to fire weapons, WASD to move around the field, and Space to jump.';
            } else if (lowerName.includes('puzzle') || lowerName.includes('math') || lowerName.includes('logic') || lowerName.includes('chess') || lowerName.includes('word') || lowerName.includes('maze') || lowerDesc.includes('puzzle') || lowerDesc.includes('logic')) {
              category = 'Puzzle';
              instructions = 'Use Mouse inputs or simple Arrow keys to solve logical stages, progress elements, and click buttons.';
            }

            const simpleName = name
              .replace(/\\x20/g, ' ')
              .replace(/\\x27/g, "'")
              .replace(/\\x22/g, '"')
              .replace(/\\/g, '')
              .trim();

            games.push({
              id: simpleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, ''),
              title: simpleName,
              category: category,
              description: `Play ${simpleName} unblocked on Goated Fun. Enjoy instant full-screen capability, high-performance speeds, and premium framing.`,
              instructions: instructions,
              iframeUrl: url,
              thumbnailUrl: icon || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop",
              rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
              tags: [category.toLowerCase().replace(/[^a-z]+/g, ''), "unblocked", "retro", "arcade"]
            });
          }
        }
      }
    } else {
      i++;
    }
  }

  console.log(`Successfully extracted ${games.length} robust, unique game definitions!`);
  
  if (games.length > 0) {
    fs.writeFileSync('src/games.json', JSON.stringify(games, null, 2));
    console.log('Updated src/games.json!');
  }
}

extractPreciseGames();
