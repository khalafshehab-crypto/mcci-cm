const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Also fix the model to gemini-1.5-flash which is the standard flash model.
content = content.replace(/gemini-3\.6-flash/g, 'gemini-1.5-flash');

// Fix the backticks in the prompt
content = content.replace(/مثل \`\`\` ،/g, "مثل ``` ،"); // If I want to output literally three backticks inside a template string, I don't need to escape them if I'm not using them for templating? Wait, if I'm doing it in a template string, I have to escape the first one or just use regular quotes.

fs.writeFileSync('server.ts', content);
