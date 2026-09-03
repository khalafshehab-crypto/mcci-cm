import fs from 'fs';
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(
  'phone: req.phone,',
  'phone: req.phone || "",'
);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
