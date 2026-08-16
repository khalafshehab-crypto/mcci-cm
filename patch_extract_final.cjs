const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // ---------------------------------------------------------
    // 1) Replace the FIRST block (Extract Discussions)
    // ---------------------------------------------------------
    const block1Regex = /let fileBase64 = "";[\s\S]*?body: JSON\.stringify\(\{ prompt, fileBase64, mimeType \}\)\s*\n\s*\}\);/m;
    const block1Replacement = `let fileBase64 = "";
        let mimeType = "";
        let fileId = "";
        let accessToken = "";
        try {
            accessToken = (await getSharedAccessToken()) || "";
        } catch(e) {}
        
        if (typeof agendaMinutesFile === 'string') {
            const match = agendaMinutesFile.match(/[-\\w]{25,}/);
            if (match) fileId = match[0];
            else {
                const driveData = await downloadDriveFileBase64(agendaMinutesFile);
                fileBase64 = driveData.base64;
                mimeType = driveData.mimeType;
            }
        } else {
            let uploadedToDrive = false;
            if (accessToken) {
                try {
                    const folderId = await autoCreateEventDriveFolders(evt, []);
                    if (folderId) {
                        const reader = new FileReader();
                        const b64 = await new Promise((resolve) => {
                            reader.onload = (e) => resolve((e.target?.result).split(',')[1]);
                            reader.readAsDataURL(agendaMinutesFile);
                        });
                        mimeType = agendaMinutesFile.type;
                        const docName = "محضر_مستورد_" + agendaMinutesFile.name;
                        const res = await uploadBinaryFileToDrive(docName, b64, mimeType, folderId);
                        if (res && res.id) {
                            fileId = res.id;
                            uploadedToDrive = true;
                            const fileUrl = \`https://drive.google.com/file/d/\${res.id}/view\`;
                            updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
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
                    reader.onload = (e) => resolve((e.target?.result).split(',')[1]);
                    reader.readAsDataURL(agendaMinutesFile);
                });
                mimeType = agendaMinutesFile.type;
            }
        }

        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"title\\": \\"عنوان البند\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";

        const response = await fetch('/api/gemini/extract-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, fileBase64, mimeType, fileId, accessToken })
        });`;

    content = content.replace(block1Regex, block1Replacement);

    // ---------------------------------------------------------
    // 2) Replace the SECOND block (Extract Agenda Items)
    // ---------------------------------------------------------
    const block2Regex = /let fileBase64 = "";\s*let mimeType = "";\s*let docName = "";\s*if \(typeof agendaMinutesFile === 'string'\) \{[\s\S]*?const aiText = responseData\.result \|\| "";/m;
    const block2Replacement = `let fileBase64 = "";
                                                                            let mimeType = "";
                                                                            let docName = "";
                                                                            let fileId = "";
                                                                            let accessToken = "";
                                                                            try {
                                                                                accessToken = (await getSharedAccessToken()) || "";
                                                                            } catch(e) {}
                                                                            
                                                                            if (typeof agendaMinutesFile === 'string') {
                                                                                docName = "محضر_مستورد_من_رابط.pdf";
                                                                                const match = agendaMinutesFile.match(/[-\\w]{25,}/);
                                                                                if (match) fileId = match[0];
                                                                                else {
                                                                                    try {
                                                                                        const driveData = await downloadDriveFileBase64(agendaMinutesFile);
                                                                                        fileBase64 = driveData.base64;
                                                                                        mimeType = driveData.mimeType;
                                                                                    } catch (e) {
                                                                                        console.error(e);
                                                                                        showGlobalToast("خطأ: " + e.message, "error");
                                                                                        setIsReadingMinutes(false);
                                                                                        return;
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                docName = "محضر_مستورد_" + agendaMinutesFile.name;
                                                                                let uploadedToDrive = false;
                                                                                if (accessToken) {
                                                                                    try {
                                                                                        const folderId = await autoCreateEventDriveFolders(evt, []);
                                                                                        if (folderId) {
                                                                                            const reader = new FileReader();
                                                                                            const b64 = await new Promise((resolve) => {
                                                                                                reader.onload = (e) => resolve((e.target?.result).split(',')[1]);
                                                                                                reader.readAsDataURL(agendaMinutesFile);
                                                                                            });
                                                                                            mimeType = agendaMinutesFile.type;
                                                                                            const res = await uploadBinaryFileToDrive(docName, b64, mimeType, folderId);
                                                                                            if (res && res.id) {
                                                                                                fileId = res.id;
                                                                                                uploadedToDrive = true;
                                                                                                const fileUrl = \`https://drive.google.com/file/d/\${res.id}/view\`;
                                                                                                updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
                                                                                                showGlobalToast("تم استيراد المحضر وأرشفته في جوجل درايف بنجاح", "success");
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
                                                                                        reader.onload = (e) => resolve((e.target?.result).split(',')[1]);
                                                                                        reader.readAsDataURL(agendaMinutesFile);
                                                                                    });
                                                                                    mimeType = agendaMinutesFile.type;
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
                                                                            });

                                                                            if (!response.ok) {
                                                                                let errMsg = "خطأ مجهول";
                                                                                try {
                                                                                    const textErr = await response.text();
                                                                                    if (textErr) {
                                                                                        try {
                                                                                            const errObj = JSON.parse(textErr);
                                                                                            errMsg = errObj.details || errObj.error || "خطأ مجهول";
                                                                                            if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                                                                                                errMsg = "عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية من الذكاء الاصطناعي (Quota Exceeded). يرجى المحاولة لاحقاً.";
                                                                                            }
                                                                                        } catch(e) {
                                                                                            errMsg = "تعذر الاتصال بالخادم، قد يكون حجم الملف كبيراً جداً (حاول رفع ملف أقل من 1 ميجا) أو حدث خطأ في الشبكة";
                                                                                        }
                                                                                    }
                                                                                } catch(e) {}
                                                                                throw new Error(errMsg);
                                                                            }

                                                                            const responseData = await response.json();
                                                                            const aiText = responseData.result || "";`;
                                                                            
    content = content.replace(block2Regex, block2Replacement);
    fs.writeFileSync(file, content);
    console.log("Patched " + file);
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
