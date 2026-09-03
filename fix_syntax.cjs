const fs = require('fs');
let text = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');
text = text.replace(/,\s*,\s*ShieldCheck/g, ', ShieldCheck');
fs.writeFileSync('src/pages/OrgChart.tsx', text);
