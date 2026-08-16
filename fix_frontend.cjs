const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/await fetch\('\/api\//g, "await fetch(window.location.hostname.includes('vercel.app') ? 'https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/' : '/api/");
    content = content.replace(/await fetch\("\/api\//g, "await fetch(window.location.hostname.includes('vercel.app') ? 'https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/' : '/api/");
    fs.writeFileSync(file, content);
}

const files = [
    'src/pages/CommitteesEvents.tsx',
    'src/pages/Events.tsx',
    'src/pages/CommitteesLibrary.tsx',
    'src/pages/Library.tsx',
    'src/pages/Members.tsx',
    'src/pages/CommitteesMembers.tsx',
    'src/lib/googleApi.ts'
];

files.forEach(fixFile);
console.log("Updated frontend API endpoints");
