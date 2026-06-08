import fs from 'fs';

// Load decrypter
const evalContent = fs.readFileSync('temp_eval.js', 'utf-8');
eval(evalContent);

function deobfuscateFile() {
  const content = fs.readFileSync('probe_js__chunks_PRwL-Vol.js', 'utf-8');
  const decodedMap = JSON.parse(fs.readFileSync('decoded_map.json', 'utf-8'));

  // Let's replace any pattern of word(0xHex) with its decoded string (quoted if it's not a variable or keyword, or just keep it simple)
  // Let's find matches like: \b(\w+)\((0x[0-9a-fA-F]+)\)
  // And replace them.
  // Note: We need to be careful. If the decoded string contains single or double quotes, or newlines, we should format it as a valid JS string.
  
  const result = content.replace(/\b(\w+)\((0x[0-9a-fA-F]+)\)/g, (match, fnName, hex) => {
    // If it's one of the decoder variables/functions or similar, replace it
    // Wait, is every word(0xHex) a string decoding call?
    // Let's check. Yes, usually. The decompiled file has local aliases for `a3`, like:
    // const bz = bv; etc.
    const decodedVal = decodedMap[hex];
    if (decodedVal !== undefined) {
      // Escape for JS string literal
      const escaped = JSON.stringify(decodedVal);
      return escaped;
    }
    return match;
  });

  fs.writeFileSync('deobfuscated_file.js', result, 'utf-8');
  console.log('Successfully deobfuscated file and wrote to deobfuscated_file.js!');
}

deobfuscateFile();
