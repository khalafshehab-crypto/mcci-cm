const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

content = content.replace(
    /\{committees\.map\(c => \(/g,
    `{committees.filter(c => canUserEditCommittee(c.name)).map(c => (`
);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
