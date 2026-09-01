const fs = require('fs');
const path = 'src/components/Layout.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '{ name: "Reports", nameAr: "التقارير", path: "/reports", icon: <FileText className="w-4 h-4" /> },',
  '{ name: "Reports", nameAr: "التقارير وتحليل الأداء", path: "/reports", icon: <FileText className="w-4 h-4" /> },'
);

fs.writeFileSync(path, code);
console.log("Renamed in Layout.tsx");
