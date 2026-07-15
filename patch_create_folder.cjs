const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

content = content.replace(
    /fetchGoogleAPI\("drive\/v3\/files", \{/g,
    'fetchGoogleAPI("drive/v3/files?supportsAllDrives=true", {'
);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched create folder supportsAllDrives");
