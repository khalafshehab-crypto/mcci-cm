import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_code = '''      if (aiGenMode === "reply" && aiGenReplyFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        });
        reader.readAsDataURL(aiGenReplyFile);
        replyFileBase64 = await base64Promise;
        replyFileMimeType = aiGenReplyFile.type;
      }'''

new_code = '''      if (aiGenMode === "reply" && aiGenReplyFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        });
        reader.readAsDataURL(aiGenReplyFile);
        replyFileBase64 = await base64Promise;
        replyFileMimeType = aiGenReplyFile.type;
      } else if (workspaceService === "circular" && circularMainFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        });
        reader.readAsDataURL(circularMainFile);
        replyFileBase64 = await base64Promise;
        replyFileMimeType = circularMainFile.type;
      }'''

content = content.replace(old_code, new_code)

old_prompt = '''      let systemPrompt = "";
      if (aiGenMode === "new") {'''

new_prompt = '''      let systemPrompt = "";
      if (workspaceService === "circular") {
        systemPrompt = `يرجى قراءة هذا التعميم المرفق، واستخراج النقاط التالية بوضوح وبدون أي شروحات إضافية أو استخدام علامات Markdown مثل \`\`\`، فقط أخرج النص بالتنسيق التالي:

التعميم وارد من: [استخرج اسم الجهة الوارد منها التعميم]
رقم وتاريخ: [استخرج رقم وتاريخ التعميم إذا وجد]
الموضوع: [استخرج موضوع التعميم]
نص توجيهي مقترح لإرساله للجان: [قم بصياغة رسالة توجيهية احترافية قصيرة توضح أهمية هذا التعميم وتوجيه اللجان للعمل بموجبه]`;
      }
      else if (aiGenMode === "new") {'''

content = content.replace(old_prompt, new_prompt)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
