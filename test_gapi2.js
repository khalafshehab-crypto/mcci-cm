import fs from 'fs';
const content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');
const start = content.indexOf('async function fetchGoogleAPI');
console.log(content.substring(start + 1400, start + 3000));
