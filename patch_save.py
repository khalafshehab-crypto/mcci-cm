import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_save_text = '''        let finalCloudUrl = "#";
        if (finalType === "مستندات") {
          try {
            const subjectName = aiGenSubject || "خطاب جديد";
            const folderPath = `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/الخطابات/مسودات/${subjectName}`;
            const folderId = await resolveDrivePath(folderPath);
            const { documentId, documentUrl } = await createGoogleDoc(subjectName, aiGenGeneratedText);'''

new_save_text = '''        let finalCloudUrl = "#";
        
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
            const { documentId, documentUrl } = await createGoogleDoc(subjectName, finalDocumentText);'''

content = content.replace(old_save_text, new_save_text)

old_newdoc = '''          templateText: aiGenGeneratedText,'''
new_newdoc = '''          templateText: finalDocumentText,'''
content = content.replace(old_newdoc, new_newdoc)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
