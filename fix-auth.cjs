const fs = require('fs');
let c = fs.readFileSync('src/lib/firebaseUtils.ts', 'utf8');
c = c.replace(/if \(user && localCleanup\) \{/g, 'if (user) {');
fs.writeFileSync('src/lib/firebaseUtils.ts', c);
