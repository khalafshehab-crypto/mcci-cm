const fs = require('fs');
let c = fs.readFileSync('src/lib/firebase.ts', 'utf8');

c = c.replace(
  /\(firebaseAppletConfig as any\)\.firestoreDatabaseId \|\| "\(\w+\)"/,
  '(firebaseAppletConfig as any).firestoreDatabaseId || "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675"'
);

fs.writeFileSync('src/lib/firebase.ts', c);
