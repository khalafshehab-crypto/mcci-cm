import fs from 'fs';
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');
code = code.replace(
  'alert("فشل في اعتماد طلب الانضمام.");',
  'alert("فشل في اعتماد طلب الانضمام: " + (error as any)?.message || String(error));'
);
fs.writeFileSync('src/pages/OrgChart.tsx', code);
