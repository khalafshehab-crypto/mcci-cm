const fs = require('fs');
let code = fs.readFileSync('src/pages/Committees.tsx', 'utf8');

const t = `const myMbrs = allMembers.filter((m: any) => m && String(m.committeeId) === String(comm.id));`;
const r = `const myMbrs = allMembers.filter((m: any) => m && (String(m.committeeId) === String(comm.id) || String(m.secondaryCommitteeId) === String(comm.id)));`;
code = code.replace(new RegExp(t.replace(/[.*+?^$\/{}()|[\\]\\\\]/g, '\\\\$&'), 'g'), r);

fs.writeFileSync('src/pages/Committees.tsx', code);
console.log("Updated Committees.tsx");
