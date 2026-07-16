const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /"تأكيد وتجديد المزامنة"/g,
  '"تأكيد وتجديد الاتصال"'
);

content = content.replace(
  /تجديد المزامنة مع جوجل/g,
  'تجديد الاتصال السحابي مع جوجل'
);

fs.writeFileSync('src/App.tsx', content);
