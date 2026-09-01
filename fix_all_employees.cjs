const fs = require('fs');
const path = 'src/pages/CommitteesEvents.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/evt\.employees\[0\]/g, 'evt.employees?.[0]');

fs.writeFileSync(path, code);
console.log("Replaced all evt.employees[0] with evt.employees?.[0]");
