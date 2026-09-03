const fs = require('fs');
let c = fs.readFileSync('src/lib/firebaseUtils.ts', 'utf8');
c = c.replace(/setupLocalFallback\(\);/g, '');
c = c.replace(/if \(\!localCleanup\) \{\s*\}/g, '');
fs.writeFileSync('src/lib/firebaseUtils.ts', c);
