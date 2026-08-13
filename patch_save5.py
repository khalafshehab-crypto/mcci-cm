import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# First, let's inject finalDocumentText definition right before finalCloudUrl
injection = '''        let finalDocumentText = aiGenGeneratedText;
        if (workspaceService === "circular") {
            const circularBody = aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText;
            finalDocumentText = `تعميم داخلي\\nاللجنة: ${committeeName}\\n\\nإلى: جميع أعضاء اللجان الموقرين\\nمن: إدارة اللجان\\nوارد من: ${circularIncomingFrom || "—"}\\nالتاريخ والرقم: ${circularNumberDate || "—"}\\nالموضوع: ${circularSubject || "—"}\\n\\n${circularBody}\\n\\nشاكرين ومقدرين تعاونكم،،،`;
        }
        
        let finalCloudUrl = "#";'''

content = content.replace('        let finalCloudUrl = "#";', injection, 1)

# And now replace the newDoc definition to use the new description / title for circulars
content = content.replace('title: aiGenSubject || "خطاب جديد",', 'title: aiGenSubject || circularSubject || "خطاب جديد",')
content = content.replace('description: `مجلد خطابات - مجلد مسودات | لجنة: ${committeeName} | صادر إلى: ${aiGenRecipientName}`,', 'description: workspaceService === "circular" ? `مجلد تعاميم | لجنة: ${committeeName} | موضوع: ${circularSubject || ""}` : `مجلد خطابات - مجلد مسودات | لجنة: ${committeeName} | صادر إلى: ${aiGenRecipientName}`,')

# And also replace aiGenGeneratedText with finalDocumentText in createGoogleDoc
content = content.replace('createGoogleDoc(subjectName, aiGenGeneratedText)', 'createGoogleDoc(subjectName, finalDocumentText)')

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
