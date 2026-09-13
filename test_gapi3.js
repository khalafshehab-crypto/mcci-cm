import fs from 'fs';
const content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');
const start = content.indexOf('if (response.status === 401)');
console.log(content.substring(start, start + 1000));
