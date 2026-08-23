const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// We need to inject userApiKey in fetch request bodies.
// The letter generation endpoint is: "gemini/generate-new-letter"
// The recommendation endpoint is: "gemini/smart-recommendation"
// Let's replace the body stringification.

content = content.replace(
  /JSON\.stringify\(\{\n\s*mode:/g,
  `JSON.stringify({ userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined, mode:`
);

content = content.replace(
  /JSON\.stringify\(\{ text: /g,
  `JSON.stringify({ userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined, text: `
);

content = content.replace(
  /JSON\.stringify\(\{\n\s*text:/g,
  `JSON.stringify({ userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined, text:`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
