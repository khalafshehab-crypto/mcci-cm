const fs = require('fs');
const path = 'src/components/Layout.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetLine = '{ name: "Analytics", nameAr: "تحليل الأداء", path: "/analytics", icon: <BarChart2 className="w-4 h-4" /> },';
code = code.replace(targetLine + '\n', '');
code = code.replace(targetLine, '');

fs.writeFileSync(path, code);
console.log("Removed from Layout.tsx");
