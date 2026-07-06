const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// replace import
content = content.replace("import { cascadeCommitteeRename } from '../lib/cascadeUpdates';", "import { cascadeCommitteeRename, cascadeCommitteeDelete } from '../lib/cascadeUpdates';");

// replace delete logic
const target = `       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseComm(String(existing.id));
       }`;
const replacement = `       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseComm(String(existing.id));
          cascadeCommitteeDelete(existing.name).catch(console.error);
       }`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
