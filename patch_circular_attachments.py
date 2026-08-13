import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_block = '''        const newDoc = {
          title: aiGenSubject || circularSubject || "خطاب جديد",
          description: workspaceService === "circular" ? `مجلد تعاميم | لجنة: ${committeeName} | موضوع: ${circularSubject || ""}` : `مجلد خطابات - مجلد مسودات | لجنة: ${committeeName} | صادر إلى: ${aiGenRecipientName}`,
          type: workspaceService === "circular" ? "تعميم" : finalType,
          creator: creatorName,
          cloudUrl: finalCloudUrl,
          downloadUrl: finalCloudUrl,
          lastUpdated: new Date().toISOString().split('T')[0],
          isFavorite: false,
          templateText: finalDocumentText,
          committeeId: committee.id || "",
        };'''

new_block = '''        const urlAttachments = [];
        if (typeof circularMainFile === 'string') urlAttachments.push(circularMainFile);
        if (typeof circularAtt1 === 'string') urlAttachments.push(circularAtt1);
        if (typeof circularAtt2 === 'string') urlAttachments.push(circularAtt2);
        if (typeof circularAtt3 === 'string') urlAttachments.push(circularAtt3);
        
        const newDoc = {
          title: aiGenSubject || circularSubject || "خطاب جديد",
          description: workspaceService === "circular" ? `مجلد تعاميم | لجنة: ${committeeName} | موضوع: ${circularSubject || ""}` : `مجلد خطابات - مجلد مسودات | لجنة: ${committeeName} | صادر إلى: ${aiGenRecipientName}`,
          type: workspaceService === "circular" ? "تعميم" : finalType,
          creator: creatorName,
          cloudUrl: finalCloudUrl,
          downloadUrl: finalCloudUrl,
          lastUpdated: new Date().toISOString().split('T')[0],
          isFavorite: false,
          templateText: finalDocumentText,
          committeeId: committee.id || "",
          attachments: urlAttachments,
        };'''

content = content.replace(old_block, new_block)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
