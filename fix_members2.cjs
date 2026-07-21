const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

code = code.replace(
  'secondaryCommitteeName: selectedComm?.name || ""',
  'secondaryCommitteeName: committees.find(c => c.id === selectedCommitteeId)?.name || ""'
);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
