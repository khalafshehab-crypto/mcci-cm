const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

code = code.replace(/\|\|\s*joinRequestsLoading/g, '');
code = code.replace(/joinRequestsLoading\s*\|\|/g, '');

fs.writeFileSync('src/components/AuthGate.tsx', code);
console.log("Fixed joinRequestsLoading");
