const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');
content = content.replace(/const originalError.*?(?=import \{ StrictMode)/s, '');
fs.writeFileSync('src/main.tsx', content);
