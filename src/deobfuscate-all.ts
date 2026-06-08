import fs from 'fs';

function extractFunctionsWithState(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');

  function getFunctionBlock(startIndex: number): string {
    let openBrackets = 0;
    let insideSingleQuote = false;
    let insideDoubleQuote = false;
    let insideTemplate = false;
    let escape = false;
    let result = '';
    let started = false;

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      result += char;

      if (escape) {
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        continue;
      }

      if (char === "'" && !insideDoubleQuote && !insideTemplate) {
        insideSingleQuote = !insideSingleQuote;
        continue;
      }
      if (char === '"' && !insideSingleQuote && !insideTemplate) {
        insideDoubleQuote = !insideDoubleQuote;
        continue;
      }
      if (char === '`' && !insideSingleQuote && !insideDoubleQuote) {
        insideTemplate = !insideTemplate;
        continue;
      }

      if (!insideSingleQuote && !insideDoubleQuote && !insideTemplate) {
        if (char === '{') {
          openBrackets++;
          started = true;
        } else if (char === '}') {
          openBrackets--;
          if (started && openBracesCount() === 0) {
            break;
          }
        }
      }
    }
    
    function openBracesCount() { return openBrackets; }
    return result;
  }

  // Find array definition function
  // We look for "function a2()" or similar. Let's search broadly for "function a" or similar that defines an array
  // In javascript-obfuscator, the array function is usually called right before the rotator.
  // The rotator matches: (function(aP,aQ){ ... }(a2,0x96771))
  // Let's find the rotator and extract the array function name and rotator hex.
  const rotatorPattern = /\(function\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)\s*\{[\s\S]+?\}\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*(0x[0-9a-fA-F]+)\s*\)\)/;
  const rotatorMatch = content.match(rotatorPattern);
  if (!rotatorMatch) {
    console.log(`Could not find rotator pattern in ${filePath}`);
    return null;
  }

  const arrayFuncName = rotatorMatch[3];
  const rotatorHex = rotatorMatch[4];
  console.log(`[${filePath}] Rotator matches array function "${arrayFuncName}" with hex "${rotatorHex}"`);

  // Find array function index
  const arrayFuncIndex = content.indexOf(`function ${arrayFuncName}()`);
  if (arrayFuncIndex === -1) {
    console.log(`Could not find array function "function ${arrayFuncName}()" in ${filePath}`);
    return null;
  }
  const arrayFuncBlock = getFunctionBlock(arrayFuncIndex);

  // Find the decoder function. It's usually name like function a3(a, b) soon after arrayFuncBlock or rotator
  // Let's search for "function a3" or check if we can locate any function soon after arrayFuncBlock
  // Wait, let's search for "function a3(" or "function b(" or similar
  // Let's search for any function defined as "function name(a, b)" or "function name(a)"
  // Usually there's a decoder call inside the rotator, such as const bv=a3
  const rotatorCode = rotatorMatch[0];
  const decoderNameMatch = rotatorCode.match(/const\s+\w+\s*=\s*([a-zA-Z0-9_]+)/);
  if (!decoderNameMatch) {
    console.log(`Could not identify decoder function name from rotator code in ${filePath}`);
    return null;
  }
  const decoderFuncName = decoderNameMatch[1];
  console.log(`[${filePath}] Decoder function is "${decoderFuncName}"`);

  const decoderFuncIndex = content.indexOf(`function ${decoderFuncName}(`);
  if (decoderFuncIndex === -1) {
    console.log(`Could not find decoder function "function ${decoderFuncName}" in ${filePath}`);
    return null;
  }
  const decoderFuncBlock = getFunctionBlock(decoderFuncIndex);

  const fullScript = `
${arrayFuncBlock}
// Execute rotator
${rotatorCode}
// Define decoder function
${decoderFuncBlock}

// Decoded exporter
global.decodeString = function(hexVal) {
  try {
    return ${decoderFuncName}(hexVal);
  } catch (err) {
    return "ERROR:" + err.message;
  }
};
`;

  return fullScript;
}

function processFile(filePath: string, outPathRef: string) {
  const setupCode = extractFunctionsWithState(filePath);
  if (!setupCode) return;

  const content = fs.readFileSync(filePath, 'utf-8');

  // Eval setup code to register decodeString
  try {
    eval(setupCode);
    console.log(`[${filePath}] Evaluated setup block successfully.`);

    // Match hex calls to find strings
    const regex = /0x[0-9a-fA-F]+/g;
    const matches = content.match(regex) || [];
    const uniqueHex = Array.from(new Set(matches));

    const decodedMap: Record<string, string> = {};
    for (const hex of uniqueHex) {
      decodedMap[hex] = (global as any).decodeString(parseInt(hex, 16));
    }

    // Now copy and replace inside the main content
    const deobfuscated = content.replace(/\b(\w+)\((0x[0-9a-fA-F]+)\)/g, (match, fnName, hex) => {
      const decodedVal = decodedMap[hex];
      if (decodedVal !== undefined) {
        return JSON.stringify(decodedVal);
      }
      return match;
    });

    fs.writeFileSync(outPathRef, deobfuscated, 'utf-8');
    console.log(`[${filePath}] Successfully wrote deobfuscated output to ${outPathRef}`);
  } catch (err: any) {
    console.error(`[${filePath}] Failed evaluation/deobfuscation:`, err.message);
  }
}

// Process EDxVzbrr.js as well!
processFile('probe_js__chunks_EDxVzbrr.js', 'deobfuscated_EDxVzbrr.js');
processFile('probe_js__chunks_PRwL-Vol.js', 'deobfuscated_PRwL-Vol.js');
