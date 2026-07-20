const fs = require('fs');

let code = fs.readFileSync('src/pages/Library.tsx', 'utf8');

code = code.replace(/!t\.title\.includes\(searchQuery\)/g, '!(t.title || "").includes(searchQuery)');
code = code.replace(/!t\.description\.includes\(searchQuery\)/g, '!(t.description || "").includes(searchQuery)');
code = code.replace(/!t\.creator\.includes\(searchQuery\)/g, '!(t.creator || "").includes(searchQuery)');

fs.writeFileSync('src/pages/Library.tsx', code);
console.log("Patched Library.tsx");
