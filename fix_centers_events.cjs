const fs = require('fs');
let code = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

code = code.replace(/e\.title\.includes\(searchTerm\)/g, '(e.title || "").includes(searchTerm)');

fs.writeFileSync('src/pages/CentersEvents.tsx', code);
console.log("Patched CentersEvents");
