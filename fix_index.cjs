const fs = require('fs');

// Fix index.html
let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace(/<script>const originalError = console\.error;[\s\S]*?originalError\.apply\(console, args\);\};<\/script>\s*/, '');
fs.writeFileSync('index.html', indexContent);
console.log('Fixed index.html');

// Fix src/main.tsx
let mainContent = fs.readFileSync('src/main.tsx', 'utf8');
mainContent = mainContent.replace(/const originalError = console\.error;[\s\S]*?originalError\(\.\.\.args\);\s*\};\s*/, '');
fs.writeFileSync('src/main.tsx', mainContent);
console.log('Fixed main.tsx');
