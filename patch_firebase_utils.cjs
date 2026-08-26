const fs = require('fs');
let code = fs.readFileSync('src/lib/firebaseUtils.ts', 'utf-8');

code = code.replace(/logSystemAction\(collectionName, "UPDATE", id\);\s+/g, '');

fs.writeFileSync('src/lib/firebaseUtils.ts', code);
console.log("Patched firebaseUtils");
