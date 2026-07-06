const fs = require('fs');

let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

// replace Set
const target = `const updatedComms = Array.from(new Set(currentComms.filter(c => c !== committeeName && dbCommittees.some((dc: any) => dc.name === c))));`;
const replacement = `const updatedComms = Array.from(new Set<string>(currentComms.filter(c => c !== committeeName && dbCommittees.some((dc: any) => dc.name === c))));`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/OrgChart.tsx', content);
