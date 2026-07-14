const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');
content = content.replace('const { signInWithPopup } = require("firebase/auth");', '');
fs.writeFileSync('src/lib/googleApi.ts', content);
