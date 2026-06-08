import fs from 'fs';

async function run() {
  const domain = 'https://saugatr-arts86264.daphnechanconsulting.net';
  
  // 1. Probe common list endpoints
  const endpoints = [
    '/games.json',
    '/assets/games.json',
    '/api/games',
    '/src/games.json',
    '/data/games.json'
  ];
  
  console.log('--- Probing Game JSON endpoints ---');
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(domain + endpoint);
      console.log(`Endpoint ${endpoint}: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Length: ${text.length}`);
        if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
          console.log('FOUND JSON DATA on', endpoint);
          fs.writeFileSync('./probe_result.json', text);
          return;
        }
      }
    } catch (e) {
      console.error(`Failed to fetch ${endpoint}:`, e);
    }
  }

  // 2. Scan JavaScript files for game data
  console.log('--- Probing JS chunks ---');
  const jsFiles = [
    '/C1WB4pes.js',
    '/chunks/_5I2IFR9.js',
    '/chunks/Bmh-qy74.js',
    '/chunks/fRWd-__M.js',
    '/chunks/PRwL-Vol.js',
    '/chunks/EDxVzbrr.js',
    '/chunks/DNmuc5m-.js'
  ];

  for (const jsFile of jsFiles) {
    try {
      const res = await fetch(domain + jsFile);
      if (res.ok) {
        const text = await res.text();
        console.log(`JS ${jsFile}: length ${text.length}`);
        
        // Let's check if there are keywords like "iframe", "basket-bros", "tomb-of-the-mask", "retro-bowl", "Retro Bowl", "Minecraft", "Slope"
        const matches = [];
        if (text.includes('iframeUrl') || text.includes('iframe') || text.includes('embed') || text.includes('games')) {
          console.log(`JS chunk ${jsFile} matches general game properties!`);
          fs.writeFileSync(`./probe_js_${jsFile.replace(/\//g, '_')}`, text);
        }
      }
    } catch (e) {
      console.error(`Failed JS fetch:`, e);
    }
  }
}

run().catch(console.error);
