import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_block = '''        let finalCloudUrl = "#";
        if (finalType === "مستندات") {
          try {
            const subjectName = aiGenSubject || "خطاب جديد";
            const folderPath = `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/الخطابات/مسودات/${subjectName}`;
            const folderId = await resolveDrivePath(folderPath);
            const { documentId, documentUrl } = await createGoogleDoc(subjectName, aiGenGeneratedText);
            await moveDriveFile(documentId, folderId);
            finalCloudUrl = documentUrl;
            
            if (aiGenReplyFile) {
              const attachmentName = `مرفق خطاب ${subjectName} ${committeeName}`;
              await uploadFileToDriveByPath(aiGenReplyFile, folderPath, attachmentName);
            }
            if (workspaceService === "circular") {
               if (circularMainFile && typeof circularMainFile === 'object') await uploadFileToDriveByPath(circularMainFile as File, folderPath, (circularMainFile as File).name);
               if (circularAtt1 && typeof circularAtt1 === 'object') await uploadFileToDriveByPath(circularAtt1 as File, folderPath, (circularAtt1 as File).name);
               if (circularAtt2 && typeof circularAtt2 === 'object') await uploadFileToDriveByPath(circularAtt2 as File, folderPath, (circularAtt2 as File).name);
               if (circularAtt3 && typeof circularAtt3 === 'object') await uploadFileToDriveByPath(circularAtt3 as File, folderPath, (circularAtt3 as File).name);
            }
          } catch (apiError) {
            console.error("Google API Error:", apiError);
            if (targetCommittees.length === 1) {
              alert("تعذر الحفظ في Google Drive. الرجاء التأكد من ربط Google Workspace. سيتم حفظ الخطاب في المكتبة الرقمية فقط.");
            }
          }
        }
        const newDoc = {
          title: aiGenSubject || "خطاب جديد",
          description: `مجلد خطابات - مجلد مسودات | لجنة: ${committeeName} | صادر إلى: ${aiGenRecipientName}`,
          type: finalType,
          creator: creatorName,
          cloudUrl: finalCloudUrl,
          downloadUrl: finalCloudUrl,
          lastUpdated: new Date().toISOString().split('T')[0],
          isFavorite: false,
          templateText: finalDocumentText,
          committeeId: committee.id || "",
        };'''

new_block = '''        let finalCloudUrl = "#";
        
        let finalDocumentText = aiGenGeneratedText;
        if (workspaceService === "circular") {
            const circularBody = aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText;
            finalDocumentText = `تعميم داخلي\\nاللجنة: ${committeeName}\\n\\nإلى: جميع أعضاء اللجان الموقرين\\nمن: إدارة اللجان\\nوارد من: ${circularIncomingFrom || "—"}\\nالتاريخ والرقم: ${circularNumberDate || "—"}\\nالموضوع: ${circularSubject || "—"}\\n\\n${circularBody}\\n\\nشاكرين ومقدرين تعاونكم،،،`;
        }

        if (finalType === "مستندات" || workspaceService === "circular") {
          try {
            const subjectName = aiGenSubject || circularSubject || "خطاب جديد";
            const folderPath = workspaceService === "circular" ? `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/التعاميم/${subjectName}` : `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/الخطابات/مسودات/${subjectName}`;
            const folderId = await resolveDrivePath(folderPath);
            const { documentId, documentUrl } = await createGoogleDoc(subjectName, finalDocumentText);
            await moveDriveFile(documentId, folderId);
            finalCloudUrl = documentUrl;
            
            if (aiGenReplyFile) {
              const attachmentName = `مرفق خطاب ${subjectName} ${committeeName}`;
              await uploadFileToDriveByPath(aiGenReplyFile, folderPath, attachmentName);
            }
            if (workspaceService === "circular") {
               if (circularMainFile && typeof circularMainFile === 'object') await uploadFileToDriveByPath(circularMainFile as File, folderPath, (circularMainFile as File).name);
               if (circularAtt1 && typeof circularAtt1 === 'object') await uploadFileToDriveByPath(circularAtt1 as File, folderPath, (circularAtt1 as File).name);
               if (circularAtt2 && typeof circularAtt2 === 'object') await uploadFileToDriveByPath(circularAtt2 as File, folderPath, (circularAtt2 as File).name);
               if (circularAtt3 && typeof circularAtt3 === 'object') await uploadFileToDriveByPath(circularAtt3 as File, folderPath, (circularAtt3 as File).name);
            }
          } catch (apiError) {
            console.error("Google API Error:", apiError);
            if (targetCommittees.length === 1) {
              alert("تعذر الحفظ في Google Drive. الرجاء التأكد من ربط Google Workspace. سيتم حفظ الخطاب في المكتبة الرقمية فقط.");
            }
          }
        }
        const newDoc = {
          title: aiGenSubject || circularSubject || "خطاب جديد",
          description: workspaceService === "circular" ? `مجلد تعاميم | لجنة: ${committeeName} | موضوع: ${circularSubject || ""}` : `مجلد خطابات - مجلد مسودات | لجنة: ${committeeName} | صادر إلى: ${aiGenRecipientName}`,
          type: finalType,
          creator: creatorName,
          cloudUrl: finalCloudUrl,
          downloadUrl: finalCloudUrl,
          lastUpdated: new Date().toISOString().split('T')[0],
          isFavorite: false,
          templateText: finalDocumentText,
          committeeId: committee.id || "",
        };'''

content = content.replace(old_block, new_block)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
