const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

// The handleCustomLinkAttachment got inserted incorrectly.
const insertedCodeStart = 'const handleCustomLinkAttachment = (evtId: string, currentAttachments: any[]) => {';
const insertedCodeEnd = '  };\n  return (';

const startIndex = code.indexOf(insertedCodeStart);
const endIndex = code.indexOf(insertedCodeEnd) + insertedCodeEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
   // Remove the incorrectly inserted function
   code = code.substring(0, startIndex) + 'return (' + code.substring(endIndex);
   
   // Now let's insert it right before the MAIN return.
   // The main return is `return (\n    <div className="p-4` or similar.
   const mainReturnMarker = '  return (\n    <div className="p-4 max-w-7xl mx-auto space-y-6';
   const mainReturnMarkerAlt = '  return (\n    <div className="p-4';
   const mainReturnMarkerAlt2 = '  return (\n    <div className="space-y-6';
   const mainReturnMarkerAlt3 = '  return (\n    <div className="h-full flex flex-col space-y-6';
   
   let mainReturnIndex = code.indexOf(mainReturnMarker);
   if (mainReturnIndex === -1) mainReturnIndex = code.indexOf(mainReturnMarkerAlt);
   if (mainReturnIndex === -1) mainReturnIndex = code.indexOf(mainReturnMarkerAlt2);
   if (mainReturnIndex === -1) mainReturnIndex = code.indexOf(mainReturnMarkerAlt3);
   
   if (mainReturnIndex === -1) {
      // Find the last function definition or something, or just use string replace for the correct return
      const possibleReturns = code.match(/  return \(\n    <div /g);
      if (possibleReturns && possibleReturns.length > 0) {
         mainReturnIndex = code.lastIndexOf(possibleReturns[0]);
      }
   }
   
   if (mainReturnIndex !== -1) {
      const functionCode = `
  const handleCustomLinkAttachment = (evtId: string, currentAttachments: any[]) => {
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
                 name: "رابط خارجي (جوجل درايف)",
                 size: "Link",
                 date: new Date().toLocaleDateString('ar-SA'),
                 link: val
              };
              updateEventWorkflow(evtId, { attachments: [...(currentAttachments || []), newAtt] });
              setAlertState({ isOpen: true, message: "تم إضافة الرابط بنجاح.", onClose: () => {} });
           },
           onCancel: () => {}
        });
      },
      onCancel: () => {}
    });
  };
`;
      code = code.substring(0, mainReturnIndex) + functionCode + code.substring(mainReturnIndex);
   } else {
      console.log("Could not find main return.");
   }
}

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', code);
