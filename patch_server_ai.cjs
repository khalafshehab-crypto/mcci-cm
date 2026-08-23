const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Add userApiKey usage in the API routes
content = content.replace(
  /const ai = new GoogleGenAI\(\{\n\s*apiKey: \(process\.env\.GEMINI_API_KEY \|\| process\.env\.VITE_GEMINI_API_KEY\),/g,
  `const ai = new GoogleGenAI({
        apiKey: (req.body.userApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),`
);

content = content.replace(
  /if \(!\(process\.env\.GEMINI_API_KEY \|\| process\.env\.VITE_GEMINI_API_KEY\)\) \{/g,
  `if (!(req.body.userApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)) {`
);

fs.writeFileSync('server.ts', content);
