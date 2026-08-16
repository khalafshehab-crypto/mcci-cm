const fs = require('fs');
const files = [
    'src/pages/CommitteesEvents.tsx',
    'src/pages/Events.tsx',
    'src/pages/CommitteesLibrary.tsx',
    'src/pages/Library.tsx',
    'src/pages/Members.tsx',
    'src/pages/CommitteesMembers.tsx',
    'src/lib/googleApi.ts'
];
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix `/api/gemini/extract-agenda', {
    content = content.replace(/"\/api\/([^"]*?)'/g, '"/api/$1"');
    content = content.replace(/'\/api\/([^']*?)"/g, "'/api/$1'");
    
    // Check if it looks like `fetch("/api/...`
    // I want to replace ALL `fetch("/api/XXX"` or `fetch('/api/XXX'` with `fetch(getApiUrl("/api/XXX")`
    
    fs.writeFileSync(file, content);
});
console.log("Fixed mismatched quotes");
