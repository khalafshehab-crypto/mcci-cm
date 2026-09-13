import fs from 'fs';
const content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');
const start = content.indexOf('export async function createGoogleCalendarEvent');
console.log(content.substring(start, start + 1000));
