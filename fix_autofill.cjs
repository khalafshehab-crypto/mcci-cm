const fs = require('fs');
const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the prompt
  const oldPrompt = `const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id مع الـ id المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";`;
  const newPrompt = `const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\\nقائمة البنود الحالية:\\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\\n[{\\"id\\": \\"id-1\\", \\"title\\": \\"عنوان البند\\", \\"discussion\\": \\"نص المناقشة\\", \\"recommendation\\": \\"نص التوصية\\", \\"assignee\\": \\"اسم المسؤول\\", \\"durationRec\\": \\"يومين\\"}]\\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";`;
  
  content = content.replace(oldPrompt, newPrompt);
  
  // Replace the mapping logic
  const oldMapping = `const filledData = parsedItems.find((p: any) => String(p.id) === String(item.id));`;
  const newMapping = `const filledData = parsedItems.find((p: any) => String(p.id) === String(item.id) || (p.title && item.title && p.title.trim() === item.title.trim()));`;
  
  content = content.replace(oldMapping, newMapping);
  
  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}
