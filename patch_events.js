const fs = require('fs');
let content = fs.readFileSync('src/pages/Events.tsx', 'utf-8');
const searchStr = `
        let aiText = "";
        try {
            aiText = await extractAgendaClient(prompt, fileBase64, mimeType, fileId, accessToken);
`;
const replacement = `
        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"title\\": \\"عنوان البند\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";
        let aiText = "";
        try {
            aiText = await extractAgendaClient(prompt, fileBase64, mimeType, fileId, accessToken);
`;
if (content.includes(searchStr)) {
    // Only replace the last occurrence to avoid replacing the first one if they match somehow
    const parts = content.split(searchStr);
    const firstPart = parts.slice(0, parts.length - 1).join(searchStr);
    const lastPart = parts[parts.length - 1];
    fs.writeFileSync('src/pages/Events.tsx', firstPart + replacement + lastPart);
    console.log("Patched Events.tsx successfully.");
} else {
    console.log("Search string not found in Events.tsx.");
}
