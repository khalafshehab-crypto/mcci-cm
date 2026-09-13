const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

// replace mtg.date.split('/')[2] with the day number
code = code.replace(/{mtg\.date\.split\('\/'\)\[2\]}/g, '{mtg.dateObj.getDate()}');

fs.writeFileSync('src/pages/CommitteesHome.tsx', code);
console.log("Fixed date split");
