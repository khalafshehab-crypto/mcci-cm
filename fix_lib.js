const fs = require('fs');
let code = fs.readFileSync('src/pages/Library.tsx', 'utf8');

// I will just git checkout the file to restore it. But wait, git checkout failed.
// Is there a .git folder in the parent?
