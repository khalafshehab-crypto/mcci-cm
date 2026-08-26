const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

code = code.replace(
    'meetingsCount: detailedItems.filter(i => i.category === \'event\' && i.type?.includes("اجتماع")).length,',
    'meetingsCount: detailedItems.filter(i => i.category === \'event\' && i.title?.includes("اجتماع")).length,'
);

code = code.replace(
    'eventsCount: detailedItems.filter(i => i.category === \'event\' && !i.type?.includes("اجتماع")).length,',
    'eventsCount: detailedItems.filter(i => i.category === \'event\' && !i.title?.includes("اجتماع")).length,'
);

fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched stats calculation");
