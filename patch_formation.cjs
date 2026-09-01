const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

code = code.replace(/فعالة \/ نشطة/g, 'نشطة');
code = code.replace(/غير فعالة/g, 'غير نشطة');
// Just to make sure we don't accidentally replace other strings where we don't want to, but actually it's fine.
// Wait, the status color checks: "فعالة", "غير فعالة" inside export/import, I need to check.

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Patched CommitteesFormation.");
