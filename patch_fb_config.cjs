const fs = require('fs');
let config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
config.firestoreDatabaseId = 'ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675';
fs.writeFileSync('firebase-applet-config.json', JSON.stringify(config, null, 2));
