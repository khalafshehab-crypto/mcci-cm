import fs from 'fs';
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');
console.log("updateFirebaseEmp calls:", code.split('updateFirebaseEmp').length - 1);
