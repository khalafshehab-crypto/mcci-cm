const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

// Use setCachedAccessToken inside getSharedAccessToken
content = content.replace(
    'cachedAccessToken = data.token;\n             try {',
    'setCachedAccessToken(data.token);\n             try {'
);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched setCachedAccessToken usage");
