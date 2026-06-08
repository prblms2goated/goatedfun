import fs from 'fs';

function findA2Array() {
  const content = fs.readFileSync('probe_js__chunks_PRwL-Vol.js', 'utf-8');
  
  // Let's find "function a2()" definition and scan its body
  const a2Index = content.indexOf('function a2()');
  if (a2Index !== -1) {
    console.log('Found function a2() at index', a2Index);
    const body = content.substring(a2Index, a2Index + 15000);
    console.log('--- A2 function body segment ---');
    console.log(body.substring(0, 1000));
    console.log('...');
    console.log(body.substring(body.length - 1000));
  } else {
    console.log('function a2() not found, let us search for similar pattern function name()');
    // Let's search for any function definition returning a large array of strings
    const match = content.match(/function\s+\w+\(\)\s*\{\s*const\s+\w+\s*=\s*\[/);
    if (match) {
      console.log('Found generic function match:', match[0], 'at', match.index);
    }
  }
}

findA2Array();
