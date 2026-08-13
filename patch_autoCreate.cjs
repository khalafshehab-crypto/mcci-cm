const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');
content = content.replace(
  /if \(!token\) return false;/g,
  'if (!token) return null;'
);
content = content.replace(
  /return false;\n  }\n}/g,
  'return null;\n  }\n}'
);
fs.writeFileSync('src/lib/googleApi.ts', content);
