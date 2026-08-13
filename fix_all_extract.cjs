const fs = require('fs');

function restoreAndFix(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove the current messed up fetch blocks. We'll replace them precisely.
    // Actually, let's just find "const response = await fetch" and replace them.
    
    // We know there are exactly two occurrences of:
    // const response = await fetch('/api/gemini/extract-agenda'
    // Let's split the file by this string.
    
    const parts = content.split("const response = await fetch('/api/gemini/extract-agenda', {");
    
    if (parts.length === 3) {
        // Part 1: First fetch
        const endOfFirst = parts[1].indexOf('const aiText = responseData.result || "";');
        const endOfSecond = parts[2].indexOf('const aiText = responseData.result || "";');
        
        if (endOfFirst !== -1 && endOfSecond !== -1) {
            let p1 = parts[1].substring(endOfFirst + 'const aiText = responseData.result || "";'.length);
            let p2 = parts[2].substring(endOfSecond + 'const aiText = responseData.result || "";'.length);
            
            const fetch1 = `
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, fileBase64, mimeType })
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
        
            const fetch2 = `
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: "استخرج بنود جدول الأعمال كقائمة JSON Array: [{title: string, duration: number, specialist: string}] من هذا المحضر، اذا لم يوجد مدد ضعها 15",
                fileBase64,
                mimeType
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

        // Auto-archive in Google Drive
        if (typeof agendaMinutesFile !== 'string') {
            try {
                const folderId = await autoCreateEventDriveFolders(evt, []);
                if (folderId) {
                    const res = await uploadBinaryFileToDrive(
                        docName,
                        fileBase64,
                        mimeType || "application/pdf",
                        folderId
                    );
                    if (res && res.id) {
                        const fileUrl = \`https://drive.google.com/file/d/\${res.id}/view\`;
                        updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
                    }
                    showGlobalToast("تم استيراد المحضر وأرشفته واعتماده في المرفقات بنجاح", "success");
                }
            } catch (uploadErr) {
                console.error("Drive auto-archive failed:", uploadErr);
            }
        }

        const responseData = await response.json();
        const aiText = responseData.result || "";`;
        
            const newContent = parts[0] + "const response = await fetch('/api/gemini/extract-agenda', {" + fetch1 + p1 + "const response = await fetch('/api/gemini/extract-agenda', {" + fetch2 + p2;
            fs.writeFileSync(file, newContent);
            console.log("Restored and fixed " + file);
        } else {
            console.log("Could not find aiText in " + file);
        }
    } else {
        console.log("Parts length is not 3 for " + file + " (length: " + parts.length + ")");
    }
}

restoreAndFix('src/pages/CommitteesEvents.tsx');
restoreAndFix('src/pages/Events.tsx');
