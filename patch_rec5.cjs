const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

const targetFunc = `  const handleCustomLinkAttachment = (evtId: number, currentAttachments: any[]) => {
    setPromptState({
      isOpen: true,
      message: "الرجاء إدخال رابط جوجل درايف (Google Drive Link):",
      defaultValue: "https://drive.google.com/...",
      onConfirm: (val) => {
        if (!val || val.trim() === "" || val === "https://drive.google.com/...") return;
        setPromptState({
           isOpen: true,
           message: "تأكيد مسار الحفظ (اختياري):",
           defaultValue: "/Google Drive/Links",
           onConfirm: (pathVal) => {
              const newAtt = {
                 name: "مرفق خارجي (رابط درايف)",
                 url: val,
                 size: "-",
                 date: new Date().toLocaleDateString('ar-SA')
              };
              updateEventWorkflow(evtId, { attachments: [...currentAttachments, newAtt] });
              setAlertState({ isOpen: true, message: \`تم حفظ الرابط ضمن مسار: \${pathVal || 'المسار الافتراضي'}\`, onClose: () => {} });
           },
           onCancel: () => {
              setAlertState({ isOpen: true, message: "تم إلغاء حفظ الرابط.", onClose: () => {} });
           }
        });
      },
      onCancel: () => {}
    });
  };`;

const replacementFunc = `  const handleCustomLinkAttachment = (evtId: number, currentAttachments: any[]) => {
    setPromptState({
      isOpen: true,
      message: "الرجاء إدخال رابط جوجل درايف (Google Drive Link):",
      defaultValue: "https://drive.google.com/...",
      onConfirm: (val) => {
        if (!val || val.trim() === "" || val === "https://drive.google.com/...") return;
        const newAtt = {
           name: "مرفق خارجي (رابط درايف)",
           url: val,
           size: "-",
           date: new Date().toLocaleDateString('ar-SA')
        };
        updateEventWorkflow(evtId, { attachments: [...currentAttachments, newAtt] });
        setAlertState({ isOpen: true, message: "تم حفظ الرابط بنجاح.", onClose: () => {} });
      },
      onCancel: () => {}
    });
  };`;

content = content.replace(targetFunc, replacementFunc);
fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
