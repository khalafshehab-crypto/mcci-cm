const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

if (code.includes('Integrity check failed')) {
    code = code.replace(/Integrity check failed/g, 'Integrity Check Failed');
    fs.writeFileSync('src/pages/OrgChart.tsx', code);
}
