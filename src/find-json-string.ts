import fs from 'fs';

function findJsonStringInDecoded() {
  const decoded = JSON.parse(fs.readFileSync('decoded_map.json', 'utf-8'));

  console.log('Scanning decoded strings for game array signatures...');
  let found = false;

  for (const [key, val] of Object.entries(decoded)) {
    if (typeof val === 'string') {
      // Check if this string contains game-related text or JSON array structure
      if (val.includes('appName') && (val.trim().startsWith('[') || val.trim().startsWith('{') || val.includes('Drift Boss') || val.includes('Slope'))) {
        console.log(`\nFound target string at hex key ${key} (length: ${val.length})!`);
        console.log('Sample content:');
        console.log(val.substring(0, 1000));
        console.log('...');
        console.log(val.substring(val.length - 1000));
        
        // Write the extracted JSON/string to a file
        fs.writeFileSync('extracted_raw_games_json.json', val);
        found = true;
      }
    }
  }

  if (!found) {
    console.log('Could not find complete JSON string in single keys. Let us search if there are multiple parts we can concatenate or pull loosely.');
    
    // Let's print all values that look like game details or contain "+"
    const matches = [];
    for (const [key, val] of Object.entries(decoded)) {
      if (typeof val === 'string' && (val.includes('Drift Hunters') || val.includes('Retro Bowl') || val.includes('BasketBros') || val.includes('Minecraft'))) {
        matches.push({ key, length: val.length, sample: val.substring(0, 200) });
      }
    }
    console.log(`Found ${matches.length} key matches containing known game names:`, matches);
  }
}

findJsonStringInDecoded();
