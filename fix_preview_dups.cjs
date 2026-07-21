const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const target = `const duplicate = members.find(m => m.name === newMember.name && m.committeeName === newMember.committeeName);`;
const replace = `const duplicate = members.find(m => 
              (m.phone && newMember.phone && m.phone.trim() === newMember.phone.trim()) ||
              (m.email && newMember.email && m.email.trim() === newMember.email.trim()) ||
              (m.nationalId && newMember.nationalId && m.nationalId.trim() === newMember.nationalId.trim()) ||
              (m.name && newMember.name && m.name.trim() === newMember.name.trim())
            );`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Patched preview dups");
