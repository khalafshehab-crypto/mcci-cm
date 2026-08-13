import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_gen = '''      if (response.ok) {
        const data = await response.json();
        setAiGenGeneratedText(data.result || "");
        setAiGenStep(3); // التحديث: النقل للخطوة الثالثة (المعاينة)'''

new_gen = '''      if (response.ok) {
        const data = await response.json();
        const text = data.result || "";
        setAiGenGeneratedText(text);
        if (workspaceService === "circular") {
          const fromMatch = text.match(/التعميم وارد من:\s*(.*)/);
          const numMatch = text.match(/رقم وتاريخ:\s*(.*)/);
          const subMatch = text.match(/الموضوع:\s*(.*)/);
          const textMatch = text.match(/نص توجيهي مقترح لإرساله للجان:\s*([\\s\\S]*)/);
          
          if (fromMatch) setCircularIncomingFrom(fromMatch[1].trim());
          if (numMatch) setCircularNumberDate(numMatch[1].trim());
          if (subMatch) setCircularSubject(subMatch[1].trim());
        }
        setAiGenStep(3); // التحديث: النقل للخطوة الثالثة (المعاينة)'''

content = content.replace(old_gen, new_gen)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
