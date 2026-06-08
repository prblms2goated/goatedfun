import fs from 'fs';

function extractIePayload() {
  const content = fs.readFileSync('deobfuscated_PRwL-Vol.js', 'utf-8');

  // Let's find index of "ie=JSON[\"parse\"]("
  const ieIdx = content.indexOf('ie=JSON["parse"](');
  if (ieIdx === -1) {
    console.log('Could not find ie=JSON["parse"](');
    return;
  }

  console.log(`Found ie=JSON["parse"]( at index ${ieIdx}`);
  
  // Let's do a bracket matching for the parse(...) call
  let openBrackets = 0;
  let started = false;
  let parseBody = '';

  for (let i = ieIdx + 16; i < content.length; i++) {
    const char = content[i];
    parseBody += char;

    if (char === '(') {
      openBrackets++;
      started = true;
    } else if (char === ')') {
      openBrackets--;
      if (started && openBrackets === 0) {
        break;
      }
    }
  }

  console.log(`Extracted parse body of length ${parseBody.length}`);
  
  // Now let's evaluate this parseBody to a clean string of JSON using NodeJS eval!
  // Since parseBody has the form: "..." + "..." + ...
  // It is a valid JS string expression! Let's wrap it in eval() to get the pure JSON string!
  try {
    const jsonString = eval(parseBody);
    console.log('Successfully evaluated JSON string! Length:', jsonString.length);
    
    // Write out the raw JSON string
    fs.writeFileSync('pure_extracted_games_payload.json', jsonString, 'utf-8');
    
    // Now parse it as a JSON object to check the keys
    const parsedObj = JSON.parse(jsonString);
    console.log('Keys inside the games payload:', Object.keys(parsedObj));
    
    // For each key (category), print how many games are in there
    for (const [category, gamesList] of Object.entries(parsedObj)) {
      if (Array.isArray(gamesList)) {
        console.log(`Category "${category}" has ${gamesList.length} games.`);
      } else {
        console.log(`Category "${category}" is of type:`, typeof gamesList);
      }
    }
    
  } catch (err: any) {
    console.error('Failed to evaluate parseBody or parse JSON:', err.message);
  }
}

extractIePayload();
