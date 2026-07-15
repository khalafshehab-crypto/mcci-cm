const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf-8');

content = content.replace('getCachedAccessToken,', 'getSharedAccessToken, getCachedAccessToken,');
content = content.replace('if (getCachedAccessToken()) {', 'if (await getSharedAccessToken()) {');

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Patched members");
