const fs = require('fs');
const path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const CommitteesAnalytics = React\.lazy\(\(\) => import\("\.\/pages\/CommitteesAnalytics"\)\);\n?/g, '');
code = code.replace(/<Route path="\/analytics" element={<CommitteesAnalytics \/>} \/>\n?/g, '');

fs.writeFileSync(path, code);
console.log("Removed from App.tsx");
