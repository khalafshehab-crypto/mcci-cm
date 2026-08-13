const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

const oldFetch1 = `        if (!response.ok) {
            const errData = await response.json();
            const errMsg = errData.details || errData.error || "خطأ مجهول";
            if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                throw new Error("عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية.");
            } else {
                throw new Error(errMsg);
            }
        }
        
        const responseData = await response.json();`;

const newFetch1 = `        const textRes = await response.text();
        let errData, responseData;
        try {
            errData = textRes ? JSON.parse(textRes) : {};
            responseData = errData;
        } catch(e) {
            if (!response.ok) throw new Error("خطأ في الخادم (حجم الملف كبير جداً أو مشكلة في الشبكة)");
            responseData = {};
        }

        if (!response.ok) {
            const errMsg = errData.details || errData.error || "خطأ مجهول";
            if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                throw new Error("عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية.");
            } else {
                throw new Error(errMsg);
            }
        }`;

content = content.replace(oldFetch1, newFetch1);

const oldFetch2 = `                                                                            if (!response.ok) {
                                                                                const errData = await response.json();
                                                                                const errMsg = errData.details || errData.error || "خطأ مجهول";
                                                                                if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                                                                                    throw new Error("عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية من الذكاء الاصطناعي (Quota Exceeded). يرجى المحاولة لاحقاً.");
                                                                                } else {
                                                                                    throw new Error(errMsg);
                                                                                }
                                                                            }

                                                                            // Auto-archive in Google Drive
                                                                            if (typeof agendaMinutesFile !== 'string') {
                                                                                try {
                                                                                    const folderId = await autoCreateEventDriveFolders(evt, []);
                                                                                    if (folderId) {
                                                                                        const res = await uploadBinaryFileToDrive(
                                                                                            docName,
                                                                                            fileBase64 as string,
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
                                                                            
                                                                            const responseData = await response.json();`;

const newFetch2 = `                                                                            const textRes = await response.text();
                                                                            let errData, responseData;
                                                                            try {
                                                                                errData = textRes ? JSON.parse(textRes) : {};
                                                                                responseData = errData;
                                                                            } catch(e) {
                                                                                if (!response.ok) throw new Error("تعذر الاتصال بالخادم، قد يكون حجم الملف كبيراً جداً (حاول رفع ملف أقل من 1 ميجا) أو حدث خطأ في الشبكة");
                                                                                responseData = {};
                                                                            }

                                                                            if (!response.ok) {
                                                                                const errMsg = errData.details || errData.error || "خطأ مجهول";
                                                                                if (errMsg.includes("429") || errMsg.includes("Quota") || errMsg.includes("exceeded")) {
                                                                                    throw new Error("عذراً، لقد تم استنفاذ الحد الأقصى للطلبات المجانية من الذكاء الاصطناعي (Quota Exceeded). يرجى المحاولة لاحقاً.");
                                                                                } else {
                                                                                    throw new Error(errMsg);
                                                                                }
                                                                            }

                                                                            // Auto-archive in Google Drive
                                                                            if (typeof agendaMinutesFile !== 'string') {
                                                                                try {
                                                                                    const folderId = await autoCreateEventDriveFolders(evt, []);
                                                                                    if (folderId) {
                                                                                        const res = await uploadBinaryFileToDrive(
                                                                                            docName,
                                                                                            fileBase64 as string,
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
                                                                            `;

content = content.replace(oldFetch2, newFetch2);

fs.writeFileSync('src/pages/CommitteesEvents.tsx', content);
