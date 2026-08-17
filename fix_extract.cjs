const fs = require('fs');
const path = require('path');

function replaceInFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/const aiText = await extractAgendaClient\(prompt, fileBase64, mimeType, fileId, accessToken\);/g, `
        let aiText = "";
        try {
            aiText = await extractAgendaClient(prompt, fileBase64, mimeType, fileId, accessToken);
        } catch (e) {
            console.error(e);
            showGlobalToast("خطأ في قراءة المحضر: " + (e.message || "فشل غير معروف"), "error");
            setIsReadingMinutes(false);
            return;
        }
    `);
    fs.writeFileSync(file, content);
}

replaceInFile(path.join(__dirname, 'src/pages/Events.tsx'));
replaceInFile(path.join(__dirname, 'src/pages/CommitteesEvents.tsx'));
console.log("Fixed extractAgendaClient calls");
