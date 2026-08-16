const fs = require('fs');

function rewriteFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // We will find the blocks and rewrite them.
    // We already patched the first part of the blocks. Now we'll replace the whole blocks again with the ultimate fix.

    // Let's replace the whole onClick body for both blocks.
    // First block:
    const block1Regex = /let fileBase64 = null;\s*let mimeType = null;\s*let fileId = null;[\s\S]*?body: JSON\.stringify\(\{ prompt, fileBase64, mimeType, fileId, accessToken \}\)\s*\}\);/g;
    
    // We want the block1 to just do Drive Upload if local, then send fileId.
    const newBlock1 = `let fileBase64 = null;
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
            let uploadedToDrive = false;
            let docName = "محضر_مستورد_" + (agendaMinutesFile as File).name;
            if (accessToken) {
                try {
                    const folderId = await autoCreateEventDriveFolders(evt, []);
                    if (folderId) {
                        const reader = new FileReader();
                        const b64 = await new Promise((resolve) => {
                            reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                            reader.readAsDataURL(agendaMinutesFile as File);
                        });
                        mimeType = (agendaMinutesFile as File).type;
                        const res = await uploadBinaryFileToDrive(docName, b64 as string, mimeType, folderId);
                        if (res && res.id) {
                            fileId = res.id;
                            uploadedToDrive = true;
                            const fileUrl = \`https://drive.google.com/file/d/\${res.id}/view\`;
                            updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
                            showGlobalToast("تم جلب الملف وأرشفته في جوجل درايف بنجاح", "success");
                        } else {
                            fileBase64 = b64;
                        }
                    }
                } catch (e) {
                    console.error("Drive auto-archive failed:", e);
                }
            }
            if (!uploadedToDrive) {
                const reader = new FileReader();
                fileBase64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                    reader.readAsDataURL(agendaMinutesFile as File);
                });
                mimeType = (agendaMinutesFile as File).type;
            }
        }

        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"title\\": \\"عنوان البند\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";

        const response = await fetch('/api/gemini/extract-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, fileBase64, mimeType, fileId, accessToken })
        });`;

    content = content.replace(block1Regex, newBlock1);

    const block2Regex = /let fileBase64 = null;\s*let mimeType = null;\s*let docName = "محضر_مستورد\.pdf";\s*let fileId = null;[\s\S]*?body: JSON\.stringify\(\{\s*prompt: "استخرج بنود جدول الأعمال كقائمة JSON Array: \[\{title: string, duration: number, specialist: string\}\] من هذا المحضر، اذا لم يوجد مدد ضعها 15",\s*fileBase64,\s*mimeType,\s*fileId,\s*accessToken\s*\}\)\s*\}\);/g;

    const newBlock2 = `let fileBase64 = null;
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
            let uploadedToDrive = false;
            docName = "محضر_مستورد_" + (agendaMinutesFile as File).name;
            if (accessToken) {
                try {
                    const folderId = await autoCreateEventDriveFolders(evt, []);
                    if (folderId) {
                        const reader = new FileReader();
                        const b64 = await new Promise((resolve) => {
                            reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                            reader.readAsDataURL(agendaMinutesFile as File);
                        });
                        mimeType = (agendaMinutesFile as File).type;
                        const res = await uploadBinaryFileToDrive(docName, b64 as string, mimeType, folderId);
                        if (res && res.id) {
                            fileId = res.id;
                            uploadedToDrive = true;
                            const fileUrl = \`https://drive.google.com/file/d/\${res.id}/view\`;
                            updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
                            showGlobalToast("تم جلب الملف وأرشفته في جوجل درايف بنجاح", "success");
                        } else {
                            fileBase64 = b64;
                        }
                    }
                } catch (e) {
                    console.error("Drive auto-archive failed:", e);
                }
            }
            if (!uploadedToDrive) {
                const reader = new FileReader();
                fileBase64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                    reader.readAsDataURL(agendaMinutesFile as File);
                });
                mimeType = (agendaMinutesFile as File).type;
            }
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
        });`;

    content = content.replace(block2Regex, newBlock2);
    
    // AND we must remove the OLD Auto-archive block in block2 because it's now done BEFORE the fetch!
    // The old auto-archive block looks like:
    // // Auto-archive in Google Drive
    // if (typeof agendaMinutesFile !== 'string') {
    // ...
    // showGlobalToast("تم استيراد المحضر وأرشفته واعتماده في المرفقات بنجاح", "success");
    // }
    const oldArchiveRegex = /\/\/ Auto-archive in Google Drive[\s\S]*?showGlobalToast\("تم استيراد المحضر وأرشفته واعتماده في المرفقات بنجاح", "success"\);\s*\}/g;
    content = content.replace(oldArchiveRegex, '// Auto-archive already done before fetch');

    fs.writeFileSync(file, content);
    console.log("Rewrote " + file);
}

rewriteFile('src/pages/CommitteesEvents.tsx');
rewriteFile('src/pages/Events.tsx');
