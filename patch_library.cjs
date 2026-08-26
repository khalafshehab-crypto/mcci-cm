const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

// Line 921:
code = code.replace(
  /\(t\.committeeUrls && t\.committeeUrls\.length > 0 && t\.committeeUrls\[0\]\.documentUrl && t\.committeeUrls\[0\]\.documentUrl !== "#" \? t\.committeeUrls\[0\]\.documentUrl : null\)\)/g,
  '(t.committeeUrls && Object.values(t.committeeUrls).length > 0 && Object.values(t.committeeUrls)[0] && Object.values(t.committeeUrls)[0] !== "#" ? Object.values(t.committeeUrls)[0] : null))'
);

// Line 1109: type error for "info" where it expects "error" | "loading" | "success"
code = code.replace(
  /showGlobalToast\("المرفق المدخل في التعميم لا يوجد له مسار صالح\.", "info"\);/g,
  'showGlobalToast("المرفق المدخل في التعميم لا يوجد له مسار صالح.", "error");'
);

// Line 1188:
code = code.replace(
  /setAiGenCommittees\(item\.targetCommittees\?\.map\(c => String\(\(c as any\)\.id \|\| c\)\) \|\| \[\]\);/g,
  'setAiGenCommittees(item.targetCommittees?.map(c => String((c as any).id || c)) || []);'
);
code = code.replace(
  /setAiGenCommittees\(item\.targetCommittees\?\.map\(c => String\(c\.id\)\) \|\| \[\]\);/g,
  'setAiGenCommittees(item.targetCommittees?.map(c => String((c as any).id || c)) || []);'
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("Patched CommitteesLibrary");
