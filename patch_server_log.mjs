import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace(
  '      const response = await fetch(url, {',
  '      console.log("PROXY HEADERS:", headers);\n      const response = await fetch(url, {'
);
fs.writeFileSync('server.ts', content);
