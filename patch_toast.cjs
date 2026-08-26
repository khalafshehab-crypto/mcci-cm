const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

code = code.replace(
    'showGlobalToast("جاري حفظ التعميم وإنشاء المجلدات بالدرايف...", "loading");',
    'showGlobalToast("جاري التحضير لمزامنة الملفات وأرشفتها في جوجل درايف...", "loading");'
);

const loopStart = 'for (const committee of targetCommittees) {';
const newLoopStart = `for (let i = 0; i < targetCommittees.length; i++) {
        const committee = targetCommittees[i];
        const nextCommitteeName = targetCommittees[i + 1]?.name;
        let progressMsg = \`جاري مزامنة الملفات وأرشفتها في جوجل درايف... جاري حالياً أرشفة الملفات في \${committee.name}\`;
        if (nextCommitteeName) progressMsg += \` والتالي أرشفة الملفات في \${nextCommitteeName}\`;
        showGlobalToast(progressMsg, "loading", 10000);`;

code = code.replace(loopStart, newLoopStart);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("Patched loop toasts.");
