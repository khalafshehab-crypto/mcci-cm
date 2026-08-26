const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

// 1. Add createdAt to newDoc
const newDocFind = `lastUpdated: new Date().toISOString().split('T')[0],`;
const newDocReplace = `lastUpdated: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),`;
if (code.includes(newDocFind)) {
    code = code.replace(newDocFind, newDocReplace);
}

// 2. Add createdAt to the import newDoc
const importDocFind = `lastUpdated: new Date().toISOString().split("T")[0],`;
const importDocReplace = `lastUpdated: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),`;
if (code.includes(importDocFind)) {
    code = code.replace(importDocFind, importDocReplace);
}

// 3. Sort displayedTemplates
const sortFind = `).filter((t) => !deletedTemplateIds.includes(t.id));`;
const sortReplace = `).filter((t) => !deletedTemplateIds.includes(t.id)).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.lastUpdated || 0).getTime();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.lastUpdated || 0).getTime();
    return timeB - timeA;
  });`;
if (code.includes(sortFind)) {
    code = code.replace(sortFind, sortReplace);
}

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("Patched sort logic.");
