const fs = require('fs');
const path = require('path');

const files = [
    'src/pages/Events.tsx',
    'src/pages/CommitteesEvents.tsx'
];

for (const file of files) {
    const p = path.join(__dirname, file);
    let content = fs.readFileSync(p, 'utf8');

    // Make sure we have the import
    if (!content.includes('extractAgendaClient')) {
        content = content.replace('import {', 'import { extractAgendaClient } from "../lib/geminiClient";\nimport {');
    }

    // Replace the first occurrence (which is the main extract-agenda for filling existing agenda)
    content = content.replace(
        /const response = await fetch\(\(window\.location\.hostname[^]+?const responseData = await response\.json\(\);\s*const aiText = responseData\.result \|\| "";/g,
        `const aiText = await extractAgendaClient(prompt, fileBase64, mimeType, fileId, accessToken);`
    );

    // Now let's handle the second occurrence (which extracts new agenda items into a new list)
    content = content.replace(
        /const response = await fetch\(\(window\.location\.hostname[^]*?gemini\/extract-agenda"\, \{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}\,\s*body:\s*JSON\.stringify\(\{\s*prompt:\s*(.*?)\,\s*fileBase64\,\s*mimeType\,\s*fileId\,\s*accessToken\s*\}\)\s*\}\);[^]+?const responseData = await response\.json\(\);\s*const aiText = responseData\.result \|\| "";/g,
        `const aiText = await extractAgendaClient($1, fileBase64, mimeType, fileId, accessToken);`
    );

    fs.writeFileSync(p, content);
}
console.log("Done");
