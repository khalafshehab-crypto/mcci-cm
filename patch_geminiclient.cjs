const fs = require('fs');
let content = fs.readFileSync('src/lib/geminiClient.ts', 'utf8');

content = content.replace(
  /JSON\.stringify\(\{ prompt \}\)/g,
  `JSON.stringify({ userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined, prompt })`
);

content = content.replace(
  /JSON\.stringify\(\{ prompt, fileBase64, mimeType \}\)/g,
  `JSON.stringify({ userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined, prompt, fileBase64, mimeType })`
);

fs.writeFileSync('src/lib/geminiClient.ts', content);
