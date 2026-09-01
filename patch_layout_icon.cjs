const fs = require('fs');
const layoutPath = 'src/components/Layout.tsx';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

if (!layoutCode.includes('BarChart2,')) {
  layoutCode = layoutCode.replace(
    'import { \n  Settings,',
    'import { \n  BarChart2,\n  Settings,'
  );
  fs.writeFileSync(layoutPath, layoutCode);
  console.log("Layout.tsx BarChart2 imported");
}
