const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf8');

const regex = /import \{([\s\S]*?)\} from "\.\.\/lib\/googleApi";/;
const match = content.match(regex);
if (match) {
  if (!match[1].includes('getOrCreateFolder')) {
    const replacement = `import {${match[1]}, getOrCreateFolder} from "../lib/googleApi";`;
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', content);
    console.log("Import patched.");
  }
}
