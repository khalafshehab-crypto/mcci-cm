import fs from 'fs';
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(
  'setConfirmDialog({ ...confirmDialog, isOpen: false });',
  'setConfirmDialog(prev => prev ? { ...prev, isOpen: false } : { isOpen: false, title: "", message: "", onConfirm: () => {} });'
);
code = code.replace(
  'setConfirmDialog({ ...confirmDialog, isOpen: false });',
  'setConfirmDialog(prev => prev ? { ...prev, isOpen: false } : { isOpen: false, title: "", message: "", onConfirm: () => {} });'
);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
