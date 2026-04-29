import fs from 'fs';
const b = fs.readFileSync("D:/Develope/Charlie's-Star-Road/utils/supabase/client.ts");
console.log('len:', b.length);
console.log('bom:', b[0], b[1]);
// Print line 21
const lines = b.toString('utf8').split('\n');
console.log('line21:', JSON.stringify(lines[20]));
