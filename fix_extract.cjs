const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // We need to replace the two occurrences of extracting agenda.
    // The first occurrence is inside an onClick for filling discussion/recommendations.
    // The second occurrence is inside an onClick for extracting agenda items.

    // Let's search for the exact onClick logic.
    const parts = content.split("const response = await fetch('/api/gemini/extract-agenda', {");
    
    if (parts.length === 3) {
        // Part 0 is everything before the first fetch.
        // Part 1 is the body of the first fetch and everything up to the second fetch.
        // Part 2 is the body of the second fetch and the rest of the file.

        // In Part 0, right before the split, there is the logic to get fileBase64 and mimeType.
        // Let's replace the whole `try { ... }` block that sets up fileBase64.
        
        let p0 = parts[0];
        let p1 = parts[1];
        let p2 = parts[2];
        
        // We can just use a regex to replace the fetching of the file and the fetch call.
        
        content = content.replace(/let fileBase64 = null;\s*let mimeType = null;\s*let docName = "محضر_مستورد\.pdf";\s*if \(typeof agendaMinutesFile === 'string'\) \{[\s\S]*?body: JSON\.stringify\(\{ prompt, fileBase64, mimeType \}\)\s*\}\);/g, 
        `let fileBase64 = null;
        let mimeType = null;
        let docName = "محضر_مستورد.pdf";
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
            docName = "محضر_مستورد_" + (agendaMinutesFile as File).name;
        }

        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"title\\": \\"عنوان البند\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";

        const response = await fetch('/api/gemini/extract-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, fileBase64, mimeType, fileId, accessToken })
        });`);

        content = content.replace(/let fileBase64 = null;\s*let mimeType = null;\s*let docName = "محضر_مستورد\.pdf";\s*if \(typeof agendaMinutesFile === 'string'\) \{[\s\S]*?body: JSON\.stringify\(\{[\s\S]*?prompt: "استخرج بنود جدول الأعمال كقائمة JSON Array: \[\{title: string, duration: number, specialist: string\}\] من هذا المحضر، اذا لم يوجد مدد ضعها 15",\s*fileBase64,\s*mimeType\s*\}\)\s*\}\);/g, 
        `let fileBase64 = null;
        let mimeType = null;
        let docName = "محضر_مستورد.pdf";
        let fileId = null;
        let accessToken = null;
        
        try {
            accessToken = await getSharedAccessToken();
        } catch(e) {}
        
        if (typeof agendaMinutesFile === 'string') {
            docName = "محضر_مستورد_من_رابط.pdf";
            const match = agendaMinutesFile.match(/[-\\w]{25,}/);
            if (match) {
                fileId = match[0];
                showGlobalToast("جاري جلب المحضر من جوجل درايف...", "success");
            } else {
                try {
                    showGlobalToast("جاري تنزيل المحضر من جوجل درايف...", "success");
                    const driveData = await downloadDriveFileBase64(agendaMinutesFile);
                    fileBase64 = driveData.base64;
                    mimeType = driveData.mimeType;
                } catch (e) {
                    console.error(e);
                    showGlobalToast("خطأ: " + (e as Error).message, "error");
                    setIsReadingMinutes(false);
                    return;
                }
            }
        } else {
            const reader = new FileReader();
            fileBase64 = await new Promise((resolve) => {
                reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                reader.readAsDataURL(agendaMinutesFile as File);
            });
            mimeType = (agendaMinutesFile as File).type;
            docName = "محضر_مستورد_" + (agendaMinutesFile as File).name;
        }

        const response = await fetch('/api/gemini/extract-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: "استخرج بنود جدول الأعمال كقائمة JSON Array: [{title: string, duration: number, specialist: string}] من هذا المحضر، اذا لم يوجد مدد ضعها 15",
                fileBase64,
                mimeType,
                fileId,
                accessToken
            })
        });`);

        fs.writeFileSync(file, content);
        console.log("Patched " + file);
    } else {
        console.log("Could not find the fetch calls in " + file);
    }
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
