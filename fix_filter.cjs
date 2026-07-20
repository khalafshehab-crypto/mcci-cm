const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const t = `        m.name.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term) ||
        m.committeeName.toLowerCase().includes(term) ||
        (m.secondaryCommitteeName || "").toLowerCase().includes(term) ||
        (m.entity || "").toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)`;

const r = `        (m.name || "").toLowerCase().includes(term) ||
        (m.role || "").toLowerCase().includes(term) ||
        (m.committeeName || "").toLowerCase().includes(term) ||
        (m.secondaryCommitteeName || "").toLowerCase().includes(term) ||
        (m.entity || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term)`;

code = code.replace(t, r);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Patched filter!");
