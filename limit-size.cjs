const fs = require('fs');
function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /if \(\!uploadedToDrive\) \{\s*const reader = new FileReader\(\);/g;
    const replacement = `if (!uploadedToDrive) {
                if ((agendaMinutesFile as File).size > 15 * 1024 * 1024) {
                    throw new Error("حجم الملف كبير جداً للاستخراج المباشر (أكثر من 15 ميجا). يرجى التأكد من تسجيل الدخول بحساب جوجل ليتم أرشفته أولاً.");
                }
                const reader = new FileReader();`;
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log("Fixed size limit in " + file);
}
fixFile('src/pages/CommitteesEvents.tsx');
fixFile('src/pages/Events.tsx');
