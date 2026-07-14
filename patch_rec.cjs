const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

const helperCode = `
  const handleFileUploads = async (files, evt, existingAtts) => {
    setAlertState({ isOpen: true, message: "جاري الرفع والمزامنة مع أرشيف جوجل درايف...", onClose: () => {} });
    try {
      const token = getCachedAccessToken();
      const newAtts = [];
      
      if (token) {
        const rootFolderId = await getOrCreateFolder("أرشيف اللجان - الدورة 22");
        const committeeFolderId = await getOrCreateFolder(evt.committeeName || "عام", rootFolderId);
        const recFolderId = await getOrCreateFolder("التوصيات", committeeFolderId);
        const itemFolderId = await getOrCreateFolder(evt.title || "بدون عنوان", recFolderId);

        for (const file of files) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const res = await uploadBinaryFileToDrive(file.name, base64, file.type || "application/octet-stream", itemFolderId);
          newAtts.push({
            name: file.name,
            url: res && res.id ? \`https://drive.google.com/file/d/\${res.id}/view\` : "#",
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            date: new Date().toLocaleDateString('ar-SA')
          });
        }
      } else {
        files.forEach(f => newAtts.push({
          name: f.name,
          url: "#",
          size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
          date: new Date().toLocaleDateString('ar-SA')
        }));
      }

      updateEventWorkflow(evt.id, { attachments: [...existingAtts, ...newAtts] });
      setAlertState({ isOpen: true, message: "تمت المزامنة وحفظ الملفات بنجاح في أرشيف جوجل درايف.", onClose: () => {} });
    } catch (err) {
      console.error("Upload error:", err);
      setAlertState({ isOpen: true, message: "حدث خطأ أثناء رفع الملفات والمزامنة. تأكد من صلاحية الربط بحساب جوجل.", onClose: () => {} });
    }
  };
`;

content = content.replace("const handleCustomLinkAttachment = ", helperCode + "\n  const handleCustomLinkAttachment = ");

const dropSearch = `                                                  onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('border-brand', 'bg-brand/5');
                                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                      const files = Array.from(e.dataTransfer.files) as File[];
                                                      const newAtts = files.map(f => ({
                                                        name: f.name,
                                                        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
                                                        date: new Date().toLocaleDateString('ar-SA')
                                                      }));
                                                      const existing = attachmentsList || [];
                                                      
                                                      setPromptState({
    isOpen: true,
    message: "الرجاء تأكيد مسار الحفظ والأرشفة في جوجل درايف:",
    defaultValue: "/Google Drive/Committees/" + (evt.committeeName || "General"),
    onConfirm: (drivePath) => {
        if (!drivePath) {
            setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
            return;
        }
        setAlertState({ 
            isOpen: true, 
            message: "تم حفظ الملفات بنجاح في المسار: " + drivePath, 
            onClose: () => {
                updateEventWorkflow(evt.id, { attachments: [...existing, ...newAtts] });
            }
        });
    },
    onCancel: () => {
        setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
    }
});
                                                    }
                                                  }}`;

const dropReplace = `                                                  onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('border-brand', 'bg-brand/5');
                                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                      handleFileUploads(Array.from(e.dataTransfer.files), evt, attachmentsList || []);
                                                    }
                                                  }}`;

content = content.replace(dropSearch, dropReplace);

const changeSearch = `                                                    onChange={(e) => {
                                                      if (e.target.files && e.target.files.length > 0) {
                                                        const files = Array.from(e.target.files) as File[];
                                                        const newAtts = files.map(f => ({
                                                          name: f.name,
                                                          size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
                                                          date: new Date().toLocaleDateString('ar-SA')
                                                        }));
                                                        const existing = attachmentsList || [];
                                                        
                                                        setPromptState({
    isOpen: true,
    message: "الرجاء تأكيد مسار الحفظ والأرشفة في جوجل درايف:",
    defaultValue: "/Google Drive/Committees/" + (evt.committeeName || "General"),
    onConfirm: (drivePath) => {
        if (!drivePath) {
            setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
            return;
        }
        setAlertState({ 
            isOpen: true, 
            message: "تم حفظ الملفات بنجاح في المسار: " + drivePath, 
            onClose: () => {
                updateEventWorkflow(evt.id, { attachments: [...existing, ...newAtts] });
            }
        });
    },
    onCancel: () => {
        setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
    }
});
                                                      }
                                                    }}`;

const changeReplace = `                                                    onChange={(e) => {
                                                      if (e.target.files && e.target.files.length > 0) {
                                                        handleFileUploads(Array.from(e.target.files), evt, attachmentsList || []);
                                                      }
                                                    }}`;

content = content.replace(changeSearch, changeReplace);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
console.log("Replaced drop and change");
