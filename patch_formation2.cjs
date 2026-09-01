const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

code = code.replace(`status?: "فعالة" | "غير نشطة" | string;`, `status?: "نشطة" | "غير نشطة" | string;`);
code = code.replace(`status: 'فعالة',`, `status: 'نشطة',`);
// Also let's fix the placeholder in export action if it still says "الفعالة"
code = code.replace(`سيتم فرز وتصدير اللجان المحددة أبجدياً مع جلب كافة الإحصائيات الفعالة تلقائياً.`, `سيتم فرز وتصدير اللجان المحددة أبجدياً مع جلب كافة الإحصائيات النشطة تلقائياً.`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Patched CommitteesFormation 2.");
