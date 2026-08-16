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
    // revert my previous fix
    content = content.replace(/await fetch\(window\.location\.hostname\.includes\('vercel\.app'\) \? 'https:\/\/ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447\.europe-west2\.run\.app\/api\/' : '\/api\//g, 'await fetch("/api/');
    
    // apply it properly
    content = content.replace(/await fetch\("\/api\/(.*?)"/g, 'await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "$1"');
    content = content.replace(/await fetch\('\/api\/(.*?)'/g, 'await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "$1"');
    
    fs.writeFileSync(file, content);
});
console.log("Fixed frontend files correctly");
