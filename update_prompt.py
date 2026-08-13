import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_prompt = '''      let systemPrompt = "";
      if (aiGenMode === "new") {
        systemPrompt = `أنت خبير صياغة خطابات رسمية سعودية في الغرفة التجارية (غرفة مكة المكرمة).

يرجى صياغة خطاب رسمي احترافي بناءً على المعطيات التالية:'''

new_prompt = '''      let systemPrompt = "";
      if (workspaceService === "circular") {
        systemPrompt = `أنت خبير صياغة تعاميم رسمية سعودية في الغرفة التجارية (غرفة مكة المكرمة).
يرجى صياغة تعميم رسمي احترافي بناءً على المعطيات التالية:
موضوع التعميم: ${aiGenSubject}
التفاصيل والنقاط المطلوبة في التعميم: ${aiGenDetails}
لجنة: ${commName}
جهة التوقيع: ${signatoryInfo}

يجب أن يحتوي الرد على البيانات التالية بتنسيق دقيق ليسهل استخراجه:
التعميم وارد من: [الجهة التي ورد منها التعميم، استنتجها من التفاصيل أو اكتب إدارات الغرفة]
رقم وتاريخ: [اكتب رقم وتاريخ تخيلي أو اتركه فارغاً]
الموضوع: ${aiGenSubject}
عرض التعميم:
[نص التعميم التفصيلي بأسلوب إداري رصين ومحكم، يبدأ بتحية مناسبة ثم الدخول في الموضوع مباشرة]
`;
      } else if (aiGenMode === "new") {
        systemPrompt = `أنت خبير صياغة خطابات رسمية سعودية في الغرفة التجارية (غرفة مكة المكرمة).

يرجى صياغة خطاب رسمي احترافي بناءً على المعطيات التالية:'''

content = content.replace(old_prompt, new_prompt)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)

