const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(/let fileBase64 = null;\s*let mimeType = null;\s*if \(typeof agendaMinutesFile === 'string'\) \{\s*const driveData = await downloadDriveFileBase64\(agendaMinutesFile\);\s*fileBase64 = driveData\.base64;\s*mimeType = driveData\.mimeType;\s*\} else \{\s*const reader = new FileReader\(\);\s*fileBase64 = await new Promise\(\(resolve\) => \{\s*reader\.onload = \(e\) => resolve\(\(e\.target\?\.result as string\)\.split\(','\)\[1\]\);\s*reader\.readAsDataURL\(agendaMinutesFile as File\);\s*\}\);\s*mimeType = \(agendaMinutesFile as File\)\.type;\s*\}\s*const prompt = "استخرج المناقشة \(discussion\)، التوصية \(recommendation\)، المسؤول \(assignee\)، ومدة التنفيذ \(durationRec\) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق\.\\nقائمة البنود الحالية:\\n" \+ JSON\.stringify\(agenda\.map\(\(a\) => \(\{ id: a\.id, title: a\.title \}\)\)\) \+ "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n\[\{\\"id\\": \\"id-1\\", \\"title\\": \\"عنوان البند\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"\}\]\\nيجب أن تتطابق الـ id و الـ title مع المرسل\. إذا لم تجد مناقشة أو توصية اتركها فارغة\.";\s*const response = await fetch\('\/api\/gemini\/extract-agenda', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ prompt, fileBase64, mimeType \}\)\s*\}\);/g, 
        `let fileBase64 = null;
        let mimeType = null;
        let fileId = null;
        let accessToken = null;
        
        try {
            accessToken = await getSharedAccessToken();
        } catch(e) {}
        
        if (typeof agendaMinutesFile === 'string') {
            const match = agendaMinutesFile.match(/[-\\w]{25,}/);
            if (match) {
                fileId = match[0];
                showGlobalToast("جاري جلب المحضر من جوجل درايف...", "success");
            } else {
                showGlobalToast("جاري تنزيل المحضر من جوجل درايف...", "success");
                const driveData = await downloadDriveFileBase64(agendaMinutesFile);
                fileBase64 = driveData.base64;
                mimeType = driveData.mimeType;
            }
        } else {
            const reader = new FileReader();
            fileBase64 = await new Promise((resolve) => {
                reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                reader.readAsDataURL(agendaMinutesFile as File);
            });
            mimeType = (agendaMinutesFile as File).type;
        }

        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"title\\": \\"عنوان البند\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";

        const response = await fetch('/api/gemini/extract-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, fileBase64, mimeType, fileId, accessToken })
        });`);

    fs.writeFileSync(file, content);
    console.log("Patched " + file);
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
