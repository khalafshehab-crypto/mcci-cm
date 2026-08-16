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
    content = content.replace(/await fetch\("\/api\/(.*?)', \{/g, 'await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "$1", {');
    content = content.replace(/await fetch\('\/api\/(.*?)", \{/g, 'await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "$1", {');
    // For normal cases where the revert didn't quite work:
    content = content.replace(/await fetch\("\/api\/(.*?)"/g, 'await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "$1"');
    
    // Some lines might now have double replacement if I'm not careful. Let's just fix the broken lines manually!
    fs.writeFileSync(file, content);
});
console.log("Fixed quotes");
