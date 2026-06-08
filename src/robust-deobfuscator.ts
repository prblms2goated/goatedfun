import fs from 'fs';

function extractFunctionsWithState() {
  const content = fs.readFileSync('probe_js__chunks_PRwL-Vol.js', 'utf-8');

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
          if (started && openBrackets === 0) {
            break;
          }
        }
      }
    }
    return result;
  }

  const a2Index = content.indexOf('function a2()');
  if (a2Index === -1) {
    console.error('Cannot find function a2()');
    return;
  }
  const a2Block = getFunctionBlock(a2Index);

  const a3Index = content.indexOf('function a3(');
  if (a3Index === -1) {
    console.error('Cannot find function a3()');
    return;
  }
  const a3Block = getFunctionBlock(a3Index);

  // Find the IIFE
  const iifePattern = /\(function\s*\(\s*aP\s*,\s*aQ\s*\)\s*\{[\s\S]+?\}\s*\(\s*a2\s*,\s*0x96771\s*\)\)/;
  const iifeMatch = content.match(iifePattern);
  if (!iifeMatch) {
    console.error('Cannot find IIFE');
    return;
  }
  const rotatorCode = iifeMatch[0];

  const fullScript = `
${a2Block}
// Execute rotator
${rotatorCode}
// Define function a3
${a3Block}

// Decoded exporter
global.decodeString = function(hexVal) {
  try {
    return a3(hexVal);
  } catch (err) {
    return "ERROR:" + err.message;
  }
};
`;

  fs.writeFileSync('temp_eval.js', fullScript, 'utf-8');
  console.log('Successfully wrote robust temp_eval.js!');
}

extractFunctionsWithState();
