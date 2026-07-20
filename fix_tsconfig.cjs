const fs = require('fs');
let json = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
delete json.compilerOptions.exclude;
json.exclude = ["dist", "node_modules"];
fs.writeFileSync('tsconfig.json', JSON.stringify(json, null, 2));
