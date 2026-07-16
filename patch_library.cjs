const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(
  /"ربط ومزامنة Google Workspace 🌐"/g,
  '"بوابة التكامل Google Workspace 🌐"'
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);

let content2 = fs.readFileSync('src/pages/Library.tsx', 'utf8');

content2 = content2.replace(
  /"ربط ومزامنة Google Workspace 🌐"/g,
  '"بوابة التكامل Google Workspace 🌐"'
);

fs.writeFileSync('src/pages/Library.tsx', content2);
