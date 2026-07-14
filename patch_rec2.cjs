const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

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
console.log("Fixed onChange");
