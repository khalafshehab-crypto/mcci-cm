const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/import \{ db \}/, 'import { db, auth }');
fs.writeFileSync('src/App.tsx', c);
