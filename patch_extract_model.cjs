const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const response = await ai\.models\.generateContent\(\{\s*model: "gemini-2\.5-flash",\s*contents: contents,\s*\}\);/g,
  `const response = await executeWithRetry(() => ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
      }));`
);

fs.writeFileSync('server.ts', content);
console.log('Fixed model and added retry to extract-agenda');
