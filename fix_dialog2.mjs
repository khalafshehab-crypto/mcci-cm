import fs from 'fs';
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(
  /onConfirm:\s*\(\)\s*=>\s*\{\s*setConfirmDialog\(prev => prev \? \{ \.\.\.prev, isOpen: false \} : \{ isOpen: false, title: "", message: "", onConfirm: \(\) => \{\} \}\);\s*setTimeout\(\(\) => performApproval\(true\), 300\);\s*\}/,
  'onConfirm: () => { setConfirmDialog(null); performApproval(true); }'
);
code = code.replace(
  /onCancel:\s*\(\)\s*=>\s*\{\s*setConfirmDialog\(prev => prev \? \{ \.\.\.prev, isOpen: false \} : \{ isOpen: false, title: "", message: "", onConfirm: \(\) => \{\} \}\);\s*setTimeout\(\(\) => performApproval\(false\), 300\);\s*\}/,
  'onCancel: () => { setConfirmDialog(null); performApproval(false); }'
);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
