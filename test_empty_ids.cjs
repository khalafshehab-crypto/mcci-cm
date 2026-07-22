const fs = require('fs');

let content = fs.readFileSync('src/lib/mockFirebase.ts', 'utf8');
const match = content.match(/getLocalCollection/);
console.log(match);
