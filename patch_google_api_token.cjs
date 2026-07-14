const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

const target1 = `let cachedAccessToken: string | null = null;`;
const replace1 = `let cachedAccessToken: string | null = null;
try {
  cachedAccessToken = localStorage.getItem("google_access_token");
} catch(e) {}`;

const target2 = `export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;`;
const replace2 = `export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
  try {
    if (token) localStorage.setItem("google_access_token", token);
    else localStorage.removeItem("google_access_token");
  } catch(e) {}`;

content = content.replace(target1, replace1).replace(target2, replace2);
fs.writeFileSync('src/lib/googleApi.ts', content);
