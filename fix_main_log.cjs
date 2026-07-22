const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');
content = content.replace(
  "const keyArg = args.find(a => typeof a === 'string' && !a.includes('Duplicate'));",
  "const keyArg = args[1];"
);
fs.writeFileSync('src/main.tsx', content);
