import fs from 'fs';
const content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');
console.log(content.substring(content.indexOf('async function fetchGoogleAPI'), content.indexOf('async function fetchGoogleAPI') + 1500));
