const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/Events.tsx',
    'src/pages/CommitteesEvents.tsx'
];

for (const file of files) {
    const p = path.join(__dirname, file);
    let content = fs.readFileSync(p, 'utf8');

    // Add import
    if (!content.includes('extractAgendaClient')) {
        content = content.replace('import {', 'import { extractAgendaClient } from "@/lib/geminiClient";\nimport {');
    }

    // Replace the fetch block (around 10-15 lines) with the new client call
    // We need to look for `const response = await fetch(... "gemini/extract-agenda"`
    // and the subsequent `.json()` handling.

    content = content.replace(
        /const response = await fetch\(\(window\.location\.hostname[^]*?gemini\/extract-agenda"\, \{\s*method:\s*'POST',\s*headers:.*?,\s*body: JSON\.stringify\(\{\s*(.*?)\s*\}\)\s*\}\);\s*if \(\!response\.ok\) \{[^]*?\}\s*const data = await response\.json\(\);\s*let resultText = data\.result;/g,
        `const resultText = await extractAgendaClient($1);`
    );
    
    // There's a second variant where the body is formatted with newlines inside JSON.stringify
    // Let's do a more robust string replacement manually for the fetch and error handling if regex fails.
    
    fs.writeFileSync(p, content);
}
console.log("Done");
