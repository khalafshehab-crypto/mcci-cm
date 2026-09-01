const fs = require('fs');
const path = 'src/pages/CommitteesReports.tsx';
let code = fs.readFileSync(path, 'utf8');

const str = '<AnimatePresence>\n        {selectedDetailsItem';
const index = code.indexOf(str);
console.log(code.substring(index - 200, index + 50));
