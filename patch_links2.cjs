const fs = require('fs');

const search2 = `                                                          const atts = evt.attachments || [];
                                                          if (atts.length > 0) {
                                                              mailBody += "\\n\\nالمرفقات:\\n";
                                                              atts.forEach((a, idx) => {
                                                                  mailBody += \`\${idx + 1}- \${a.name}: \${a.url}\\n\`;
                                                              });
                                                          }`;

const replace2 = `                                                          const atts = evt.attachments || [];
                                                          
                                                          let allAtts = [...atts];
                                                          if (evt.agendaMinutes && typeof evt.agendaMinutes === 'string') {
                                                              if (!allAtts.some(a => a.url === evt.agendaMinutes)) {
                                                                   allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.agendaMinutes });
                                                              }
                                                          }

                                                          if (allAtts.length > 0) {
                                                              mailBody += "\\n\\nالمرفقات:\\n";
                                                              allAtts.forEach((a, idx) => {
                                                                  mailBody += \`\${idx + 1}- \${a.name || "مرفق"}: \${a.url || ""}\\n\`;
                                                              });
                                                          }`;

const files = ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes(search2)) {
    content = content.replace(search2, replace2);
    fs.writeFileSync(file, content);
    console.log("Patched " + file);
  }
}
