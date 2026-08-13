const fs = require('fs');
const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const oldCode = `if (parsedItems && parsedItems.length > 0) {
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
																				}`;
																				
  const newCode = `if (parsedItems && parsedItems.length > 0) {
																					const newAgenda = [...agenda];
																					let addedCount = 0;
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
																						}
																					});
																					if (addedCount > 0) {
																						updateEventWorkflow(evt.id, { agenda: newAgenda });
																					}
																				}`;
																				
  if (content.includes(oldCode)) {
      content = content.replace(oldCode, newCode);
      fs.writeFileSync(file, content);
      console.log('Patched ' + file);
  } else {
      console.log('Could not find oldCode in ' + file);
      
      // fallback replace if indentation is weird
      const regex = /if \(parsedItems && parsedItems\.length > 0\) \{\s*const newAgenda = \[\.\.\.agenda\];\s*parsedItems\.forEach\(\(item: any\) => \{\s*newAgenda\.push\(\{[\s\S]*?\}\);\s*\}\);\s*updateEventWorkflow\(evt\.id, \{ agenda: newAgenda \}\);\s*\}/;
      if (regex.test(content)) {
          content = content.replace(regex, newCode);
          fs.writeFileSync(file, content);
          console.log('Patched with regex ' + file);
      } else {
          console.log('Regex also failed for ' + file);
      }
  }
}
