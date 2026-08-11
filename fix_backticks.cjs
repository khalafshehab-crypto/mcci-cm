const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');
content = content.replace(/مثل ``` ،/g, "مثل \\`\\`\\` ،");
fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
