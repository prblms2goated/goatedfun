import fs from 'fs';

function findDetails() {
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

  // Find the rotator IIFE
  const iifePattern = /\(function\s*\(\s*aP\s*,\s*aQ\s*\)\s*\{[\s\S]+?\}\s*\(\s*a2\s*,\s*0x96771\s*\)\)/;
  const iifeMatch = content.match(iifePattern);
  if (!iifeMatch) {
    console.error('Could not find the rotator IIFE');
    return;
  }
  const rotatorCode = iifeMatch[0];

  // Find function a3
  const a3Index = content.indexOf('function a3(');
  if (a3Index === -1) {
    console.error('Could not find function a3');
    return;
  }

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

  const rawScript = `
${a2Body}
// Execute rotator
${rotatorCode}
// Define function a3
${a3Body}

// Export the decoder
global.decodeString = function(hexVal) {
  try {
    return a3(hexVal);
  } catch (err) {
    return "ERROR:" + err.message;
  }
};
console.log('Testing a3:', global.decodeString(0x1bf));
`;

  fs.writeFileSync('temp_eval.js', rawScript, 'utf-8');
  console.log('Written to temp_eval.js. Now running it...');
}

findDetails();
