import fs from 'fs';

function extractCleanGames() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Let's first clean hex escapes and do string joining on the entire file content
  let cleanContent = content
    .replace(/\\x22/g, '"')
    .replace(/\\x27/g, "'")
    .replace(/\\x20/g, ' ')
    .replace(/\\x2f/g, '/')
    .replace(/\\x3a/g, ':')
    .replace(/\\x2c/g, ',')
    .replace(/\\x7b/g, '{')
    .replace(/\\x7d/g, '}');

  // Merge string concatenations
  let lenBefore = 0;
  while (cleanContent.length !== lenBefore) {
    lenBefore = cleanContent.length;
    cleanContent = cleanContent.replace(/"\s*\+\s*"/g, '');
    cleanContent = cleanContent.replace(/'\s*\+\s*'/g, "'");
    cleanContent = cleanContent.replace(/"\s*\+\s*'/g, '"');
    cleanContent = cleanContent.replace(/'\s*\+\s*"/g, "'");
  }

  console.log('Scanning for game records using localized 500-character window parser...');

  const games: any[] = [];
  const seenUrls = new Set<string>();

  // Find all positions of "appName" (with quotes or not)
  let pos = 0;
  while (true) {
    // Search for appName
    const idx = cleanContent.indexOf('appName', pos);
    if (idx === -1) break;

    // Grab a 600-character window around the index to extract all properties securely
    const windowText = cleanContent.substring(idx - 50, idx + 550);

    // Parse values within this window using targeted regexes
    const nameMatch = windowText.match(/["']?appName["']?\s*:\s*["']?([^"'\r\n,}]+)["']?/i);
    const urlMatch = windowText.match(/["']?url["']?\s*:\s*["']?([^"'\r\n,}]+)["']?/i);
    const descMatch = windowText.match(/["']?desc["']?\s*:\s*["']?([^"'\r\n,}]+)["']?/i);
    const iconMatch = windowText.match(/["']?icon["']?\s*:\s*["']?([^"'\r\n,}]+)["']?/i);

    if (nameMatch && urlMatch) {
      let name = nameMatch[1].trim();
      let url = urlMatch[1].trim();
      let desc = descMatch ? descMatch[1].trim() : 'Classic';
      let icon = iconMatch ? iconMatch[1].trim() : '';

      // Clean up any remaining quotes or backslashes
      name = name.replace(/['"\\{}[\]]+/g, '').trim();
      url = url.replace(/['"\\{}[\]]+/g, '').trim();
      desc = desc.replace(/['"\\{}[\]]+/g, '').trim();
      icon = icon.replace(/['"\\{}[\]]+/g, '').trim();

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

      if (!seenUrls.has(url) && url.startsWith('http') && isNotSocial && name.length > 1 && name !== 'AppName') {
        seenUrls.add(url);

        let category = 'Arcade';
        let instructions = 'Use standard desktop mouse clicks or WASD / Arrow Keys to move and spacebar/shift for features.';
        
        const lowerName = name.toLowerCase();
        const lowerDesc = desc.toLowerCase();

        if (lowerName.includes('moto') || lowerName.includes('drive') || lowerName.includes('drift') || lowerName.includes('car') || lowerName.includes('rider') || lowerName.includes('subway') || lowerName.includes('run') || lowerDesc.includes('racing') || lowerDesc.includes('car')) {
          category = 'Racing / Action';
          instructions = 'Accelerate with W or Up Arrow. Steer left/right with A/D or Left/Right Arrows. Use Space or Shift for active action dunks or speed boosts.';
        } else if (lowerName.includes('sport') || lowerName.includes('basket') || lowerName.includes('soccer') || lowerName.includes('ball') || lowerName.includes('tennis') || lowerDesc.includes('sport')) {
          category = 'Sports';
          instructions = 'Move using WASD or Arrow Keys. Press Space or active keys to score dunks, kick soccer balls, or execute dunks.';
        } else if (lowerName.includes('shooter') || lowerName.includes('gun') || lowerName.includes('sniper') || lowerName.includes('combat') || lowerName.includes('1v1') || lowerDesc.includes('shooter')) {
          category = 'Shooter';
          instructions = 'Aim with your Mouse. Left Click to shoot targets. Use WASD keys to move around the field and Space to jump.';
        } else if (lowerName.includes('puzzle') || lowerName.includes('math') || lowerName.includes('logic') || lowerName.includes('chess') || lowerName.includes('word') || lowerName.includes('maze') || lowerDesc.includes('puzzle') || lowerDesc.includes('logic')) {
          category = 'Puzzle';
          instructions = 'Use Mouse coordinates or click options to toggle, match, and progress stages.';
        }

        games.push({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, ''),
          title: name,
          category: category,
          description: `Play ${name} unblocked on Goated Fun. Enjoy instant full-screen capability, high-performance speeds, and premium framing.`,
          instructions: instructions,
          iframeUrl: url,
          thumbnailUrl: icon || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop",
          rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
          tags: [category.toLowerCase().replace(/[^a-z]+/g, ''), "unblocked", "retro", "arcade"]
        });
      }
    }

    pos = idx + 7;
  }

  console.log(`Successfully extracted ${games.length} clean, premium unblocked games!`);
  if (games.length > 0) {
    fs.writeFileSync('src/games.json', JSON.stringify(games, null, 2));
    console.log('Result written to src/games.json.');
    console.log('Sample games of first 10:', games.slice(0, 10));
  }
}

extractCleanGames();
