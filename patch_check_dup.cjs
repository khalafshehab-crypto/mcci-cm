const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const t1 = `    return members.some(m =>
      (nameVal && m.name.trim() === nameVal) ||
      (emailVal && m.email.trim() === emailVal) ||
      (phoneVal && m.phone.trim() === phoneVal) ||
      (nationalIdVal && m.nationalId.trim() === nationalIdVal)
    );`;
const r1 = `    return members.some(m => {
      const matches = (nameVal && m.name.trim() === nameVal) ||
                      (emailVal && m.email.trim() === emailVal) ||
                      (phoneVal && m.phone.trim() === phoneVal) ||
                      (nationalIdVal && m.nationalId.trim() === nationalIdVal);
      if (matches) {
        // If it matches but is in a different committee and has space, it's NOT a hard duplicate (can be merged)
        if (m.committeeId !== Number(importCommitteeId) && (!m.secondaryCommitteeId || m.secondaryCommitteeId === 0 || m.secondaryCommitteeId === "")) {
          return false;
        }
        return true;
      }
      return false;
    });`;

code = code.replace(new RegExp(t1.replace(/[.*+?^$\/{}()|[\\]\\\\]/g, '\\\\$&'), 'g'), r1);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Patched checkDuplicateRow");
