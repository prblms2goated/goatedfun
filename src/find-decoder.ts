import fs from 'fs';

function findDecoder() {
  const content = fs.readFileSync('probe_js__chunks_PRwL-Vol.js', 'utf-8');
  
  // Let's search for calls like \b\w+\(0x[0-9a-fA-F]+\)
  const hexCalls = content.match(/\b\w+\(0x[0-9a-fA-F]+\)/g) || [];
  console.log(`Found ${hexCalls.length} hex calls.`);
  if (hexCalls.length > 0) {
    const counts: Record<string, number> = {};
    for (const call of hexCalls) {
      const name = call.split('(')[0];
      counts[name] = (counts[name] || 0) + 1;
    }
    console.log('Hex call function names count:', counts);
  }

  // Find functions defined as function name(a, b) or function name(a, b, c) etc., returning or using the rotated array
  // The shifting IIFE was:
  // }(a2,0x96771))
  // Wait, let's inspect the shifted array or the IIFE itself
  const iifeMatch = content.match(/\(function\([^,]+,[^)]+\)\s*\{\s*const\s+\w+\s*=[\s\S]+?\}\s*\([^,]+,\s*0x[0-9a-fA-F]+\s*\)\)/);
  if (iifeMatch) {
    console.log('Found IIFE Match:', iifeMatch[0]);
  } else {
    // Let's print the first 2000 characters of the file to see the structure
    console.log('--- First 2000 characters of PRwL-Vol.js ---');
    console.log(content.substring(0, 2000));
  }
}

findDecoder();
