const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  const oldCode = `																						const itemTitle = item.title || "بند مستخرج";
																						const exists = newAgenda.some(existing => existing.title === itemTitle);`;
																						
  const newCode = `																						const itemTitle = (item.title || "بند مستخرج").trim();
																						const exists = newAgenda.some(existing => existing.title.trim() === itemTitle);`;

  if (content.includes(oldCode)) {
     content = content.replace(oldCode, newCode);
     fs.writeFileSync(file, content);
     console.log('Patched ' + file);
  } else {
     console.log('Could not find ' + file);
  }
}
