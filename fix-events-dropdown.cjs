const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

content = content.replace(
    /\{committees\.map\(c => \(/g,
    `{committees.filter(c => canUserEditCommittee(c.name)).map(c => (`
);

fs.writeFileSync('src/pages/CommitteesEvents.tsx', content);
