import fs from 'fs';

function standardizeGames() {
  const rawData = fs.readFileSync('pure_extracted_games_payload.json', 'utf-8');
  const categories = JSON.parse(rawData);

  console.log('Standardizing and cleaning all unblocked games...');

  const standardizedGames: any[] = [];
  const seenUrls = new Set<string>();

  for (const [category, gamesList] of Object.entries(categories)) {
    if (!Array.isArray(gamesList)) continue;

    for (const rawGame of gamesList) {
      if (!rawGame || typeof rawGame !== 'object') continue;

      // The raw game object keys: appName, desc, icon, url, disabled, local
      const appName = rawGame.appName || rawGame.name || 'Untitled Game';
      const url = rawGame.url || rawGame.iframeUrl || '#';
      const desc = rawGame.desc || rawGame.description || `${appName} unblocked game.`;
      const icon = rawGame.icon || rawGame.thumbnailUrl || '';

      // Check if url is a string
      if (typeof url !== 'string' || url === '#' || !url.startsWith('http')) continue;
      
      // Deduplicate by URL
      if (seenUrls.has(url)) {
        const existing = standardizedGames.find(g => g.iframeUrl === url);
        if (existing && !existing.tags.includes(category.toLowerCase())) {
          existing.tags.push(category.toLowerCase());
        }
        continue;
      }
      seenUrls.add(url);

      const baseGameId = (appName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+$/g, '')
        .replace(/^-+/g, '')) || `game-${Math.random().toString(36).substring(2, 7)}`;

      let gameId = baseGameId;
      let suffix = 2;
      while (standardizedGames.some(g => g.id === gameId)) {
        gameId = `${baseGameId}-${suffix}`;
        suffix++;
      }

      // Structure instructions
      let instructions = 'Use standard keyboard WASD or Arrow Keys for movement. Use Spacebar, Shift, or mouse click elements for gameplay functions.';
      const lowerName = appName.toLowerCase();
      const lowerCat = category.toLowerCase();

      if (lowerName.includes('moto') || lowerName.includes('drive') || lowerName.includes('drift') || lowerName.includes('car') || lowerName.includes('rider') || lowerName.includes('run') || lowerCat.includes('racing') || lowerCat.includes('running')) {
        instructions = 'Accelerate using W or Up Arrow. Steer left/right using A/D or Left/Right Arrow keys. Use Spacebar for handbrake, jumps, or stunts.';
      } else if (lowerName.includes('sport') || lowerName.includes('basket') || lowerName.includes('shoot') || lowerName.includes('combat') || lowerName.includes('1v1') || lowerCat.includes('sports') || lowerCat.includes('multiplayer')) {
        instructions = 'Move using Arrow keys or WASD. Click Left Mouse Button to shoot/attack, and use Spacebar to jump or block moves.';
      } else if (lowerName.includes('puzzle') || lowerCat.includes('puzzle')) {
        instructions = 'Use your mouse cursor to point, click, drag, and connect matching pieces or click switches to solve the stage.';
      }

      standardizedGames.push({
        id: gameId || `game-${Math.random().toString(36).substring(2, 7)}`,
        title: appName,
        category: category,
        description: desc || `Play ${appName} unblocked in full-screen on Goated Fun. Safe school-friendly arcade gaming with premium framing.`,
        instructions: instructions,
        iframeUrl: url,
        thumbnailUrl: icon || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop",
        rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
        tags: [category.toLowerCase(), "unblocked", "retro", "arcade"]
      });
    }
  }

  console.log(`Successfully standardized ${standardizedGames.length} premium retro games!`);
  fs.writeFileSync('src/games.json', JSON.stringify(standardizedGames, null, 2));
  console.log('Saved to src/games.json.');

  // Print first 5 games as verification
  console.log('Sample games:', standardizedGames.slice(0, 5));
}

standardizeGames();
