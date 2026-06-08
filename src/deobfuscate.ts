import fs from 'fs';

function extractDeobfuscator() {
  const content = fs.readFileSync('probe_js__chunks_PRwL-Vol.js', 'utf-8');

  // Find the exact body of function a2()
  const a2Index = content.indexOf('function a2()');
  if (a2Index === -1) {
    console.error('Could not find function a2');
    return;
  }

  // Bracket matcher to grab the entire a2() function
  let openBrackets = 0;
  let a2Body = '';
  let started = false;
  for (let i = a2Index; i < content.length; i++) {
    const char = content[i];
    a2Body += char;
    if (char === '{') {
      openBrackets++;
      started = true;
    } else if (char === '}') {
      openBrackets--;
      if (started && openBrackets === 0) {
        break;
      }
    }
  }

  // Find the IIFE immediately following or nearby
  const iifePattern = /\(function\s*\(\s*aP\s*,\s*aQ\s*\)\s*\{[\s\S]+?\}\s*\(\s*a2\s*,\s*0x96771\s*\)\)/;
  const iifeMatch = content.match(iifePattern);
  if (!iifeMatch) {
    console.error('Could not find the rotator IIFE');
    return;
  }
  const rotatorCode = iifeMatch[0];

  // Let's find function a3 definition. The decoder function a3 usually looks like:
  // function a3(a, b) { ... }
  const a3Index = content.indexOf('function a3(');
  if (a3Index === -1) {
    console.error('Could not find function a3');
    return;
  }

  // Bracket matcher to grab the entire a3() function
  openBrackets = 0;
  let a3Body = '';
  started = false;
  for (let i = a3Index; i < content.length; i++) {
    const char = content[i];
    a3Body += char;
    if (char === '{') {
      openBrackets++;
      started = true;
    } else if (char === '}') {
      openBrackets--;
      if (started && openBrackets === 0) {
        break;
      }
    }
  }

  console.log('Successfully extracted a2, rotator, and a3!');

  // Combine them into a single string to evaluate in our script
  const setupCode = `
    ${a2Body}
    // We execute rotator
    ${rotatorCode}
    // Function a3
    ${a3Body}
    
    // Let's define the main evaluator
    global.decodeString = function(hexVal) {
      try {
        return a3(hexVal);
      } catch (err) {
        return "ERROR:" + err.message;
      }
    }
  `;

  // Evaluate the code securely
  try {
    eval(setupCode);
    console.log('Setup code evaluated successfully!');
    
    // Let's test decodeString with a range of indices or scan for hex numbers in PRwL-Vol.js!
    // Specifically let's scan for any hex function calls like \bbz\((0x[0-9a-fA-F]+)\)
    // Wait, the bz call inside a function is actually an alias to an outer variable. Let's look for any hex literal,
    // like 0x1f3, and decode it!
    // Actually, let's extract all unique hex numbers passed in calls across the codebase and decode them!
    const matchesVal = content.match(/\b\w+\((0x[0-9a-fA-F]+)\)/g) || [];
    console.log(`Found ${matchesVal.length} hex calls.`);
    
    const hexNumbers = Array.from(new Set(
      matchesVal.map(m => {
        const h = m.match(/0x[0-9a-fA-F]+/);
        return h ? h[0] : null;
      }).filter(h => h !== null)
    )) as string[];

    console.log(`Found ${hexNumbers.length} unique hex numbers.`);

    // Decode them
    const decodedMap: Record<string, string> = {};
    for (const hex of hexNumbers) {
      decodedMap[hex] = (global as any).decodeString(hex);
    }

    fs.writeFileSync('decoded_strings.json', JSON.stringify(decodedMap, null, 2));
    console.log('Decoded strings written to decoded_strings.json!');

  } catch (err) {
    console.error('Failed to eval setupCode:', err);
  }
}

extractDeobfuscator();
