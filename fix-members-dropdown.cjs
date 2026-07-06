const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

content = content.replace(
    /\{allCommittees\.map\(\(c\) => \(/g,
    `{allCommittees.filter(c => canUserEditCommittee(c.name)).map((c) => (`
);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
