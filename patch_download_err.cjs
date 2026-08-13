const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

content = content.replace(
  /if \(!res\.ok\) throw new Error\("Failed to download file"\);/,
  `if (!res.ok) {
    const errText = await res.text();
    console.error("Drive download failed:", errText);
    throw new Error("Failed to download file: " + errText);
  }`
);

content = content.replace(
  /if \(!metaRes\.ok\) throw new Error\("Failed to fetch file metadata"\);/,
  `if (!metaRes.ok) {
    const errText = await metaRes.text();
    console.error("Drive metadata fetch failed:", errText);
    throw new Error("Failed to fetch file metadata: " + errText);
  }`
);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log('Patched errors');
