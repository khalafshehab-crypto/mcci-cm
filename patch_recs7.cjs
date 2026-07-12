const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

code = code.replace(
  'const handleCustomLinkAttachment = (evtId: string, currentAttachments: any[]) => {',
  'const handleCustomLinkAttachment = (evtId: number, currentAttachments: any[]) => {'
);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', code);
