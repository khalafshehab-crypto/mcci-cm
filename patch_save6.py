import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_block = '''        if (finalType === "مستندات") {
          try {
            const subjectName = aiGenSubject || "خطاب جديد";
            const folderPath = `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/الخطابات/مسودات/${subjectName}`;
            const folderId = await resolveDrivePath(folderPath);'''

new_block = '''        if (finalType === "مستندات" || workspaceService === "circular") {
          try {
            const subjectName = aiGenSubject || circularSubject || "خطاب جديد";
            const folderPath = workspaceService === "circular" ? `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/التعاميم/${subjectName}` : `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/الخطابات/مسودات/${subjectName}`;
            const folderId = await resolveDrivePath(folderPath);'''

content = content.replace(old_block, new_block)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
