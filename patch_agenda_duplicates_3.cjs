const fs = require('fs');
const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const searchStr = `if (parsedItems && parsedItems.length > 0) {
																					const newAgenda = [...agenda];
																					parsedItems.forEach((item: any) => {
																						newAgenda.push({
																							id: Math.random().toString(36).substring(2, 9),
																							title: item.title || "بند مستخرج",
																							duration: item.duration || 15,
																							specialist: item.specialist || commSpecialist,
																							discussion: "",
																							recommendation: "",
																							assignee: "",
																							durationRec: ""
																						});
																					});
																					updateEventWorkflow(evt.id, { agenda: newAgenda });
																					showGlobalToast("تم استخراج البنود بنجاح", "success");`;
																					
  const replaceStr = `if (parsedItems && parsedItems.length > 0) {
																					const newAgenda = [...agenda];
																					let addedCount = 0;
																					let duplicateCount = 0;
																					parsedItems.forEach((item: any) => {
																						const itemTitle = item.title || "بند مستخرج";
																						const exists = newAgenda.some(existing => existing.title === itemTitle);
																						if (!exists) {
																							newAgenda.push({
																								id: Math.random().toString(36).substring(2, 9),
																								title: itemTitle,
																								duration: item.duration || 15,
																								specialist: item.specialist || commSpecialist,
																								discussion: "",
																								recommendation: "",
																								assignee: "",
																								durationRec: ""
																							});
																							addedCount++;
																						} else {
																							duplicateCount++;
																						}
																					});
																					if (addedCount > 0) {
																						updateEventWorkflow(evt.id, { agenda: newAgenda });
																						showGlobalToast("تم استخراج " + addedCount + " بنود بنجاح" + (duplicateCount > 0 ? " (تم تجاهل " + duplicateCount + " مكررة)" : ""), "success");
																					} else {
																						showGlobalToast("لم يتم إضافة بنود جديدة (جميع البنود المستخرجة موجودة مسبقاً)", "error");
																					}`;
																					
  const blockRegex = /if \(parsedItems && parsedItems\.length > 0\) \{\s*const newAgenda = \[\.\.\.agenda\];\s*parsedItems\.forEach\(\(item: any\) => \{\s*newAgenda\.push\(\{[\s\S]*?durationRec: ""\s*\}\);\s*\}\);\s*updateEventWorkflow\(evt\.id, \{ agenda: newAgenda \}\);\s*showGlobalToast\("تم استخراج البنود بنجاح", "success"\);/s;
  
  if (blockRegex.test(content)) {
     content = content.replace(blockRegex, replaceStr);
     fs.writeFileSync(file, content);
     console.log('Patched ' + file);
  } else {
     console.log('Failed to match ' + file);
  }
}
