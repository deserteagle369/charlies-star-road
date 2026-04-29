import fs from 'fs';
const raw = fs.readFileSync("D:/Develope/Charlie's-Star-Road/utils/supabase/client.ts");
const text = raw.toString('utf8');
const lines = text.split('\n');
// Line 21 (index 20)
const line21 = lines[20];
console.log('=== LINE 21 ===');
console.log(JSON.stringify(line21));
console.log('=== CHARS AROUND COL 35 ===');
for (let i = 30; i < 50; i++) {
  const ch = line21[i];
  console.log(`  col ${i}: '${ch}' (${line21.charCodeAt(i)})`);
}
// Also check if there are any non-ascii or zero-width chars
for (let li = 0; li < lines.length; li++) {
  for (let ci = 0; ci < lines[li].length; ci++) {
    const code = lines[li].charCodeAt(ci);
    // Check for unusual chars: zero-width, BOM, control chars
    if ((code >= 0x200B && code <= 0x200F) || code === 0xFEFF || code < 32 && code !== 9 && code !== 10 && code !== 13) {
      console.log(`SUSPICIOUS at line ${li+1} col ${ci}: U+${code.toString(16).padStart(4,'0')} '${lines[li][ci]}'`);
    }
  }
}
console.log('Done. Total lines:', lines.length);
