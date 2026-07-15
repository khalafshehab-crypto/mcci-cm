const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

const regex = /if \(Date\.now\(\) - data\.timestamp < 3300000\) \{([\s\S]*?)\}/;

content = content.replace(regex, `$1`);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched token expiry check");
