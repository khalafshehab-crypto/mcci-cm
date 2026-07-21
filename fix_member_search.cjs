const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const target = `        (m.name || "").toLowerCase().includes(term) ||
        (m.role || "").toLowerCase().includes(term) ||
        (m.committeeName || "").toLowerCase().includes(term) ||
        (m.secondaryCommitteeName || "").toLowerCase().includes(term) ||
        (m.entity || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term)`;

const replace = `        (m.name || "").toLowerCase().includes(term) ||
        (m.role || "").toLowerCase().includes(term) ||
        (m.committeeName || "").toLowerCase().includes(term) ||
        (m.secondaryCommitteeName || "").toLowerCase().includes(term) ||
        (m.entity || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term) ||
        (m.phone || "").toLowerCase().includes(term) ||
        (m.nationalId || "").toLowerCase().includes(term) ||
        (m.title || "").toLowerCase().includes(term) ||
        (m.customTitle || "").toLowerCase().includes(term) ||
        (m.govAgency || "").toLowerCase().includes(term) ||
        (m.joiningMechanism || "").toLowerCase().includes(term) ||
        (m.joinedDate || "").toLowerCase().includes(term) ||
        (m.note || "").toLowerCase().includes(term)`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Patched search");
