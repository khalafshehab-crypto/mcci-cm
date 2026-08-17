const fs = require('fs');

const search = `                                                        onClick={() => {
                                                          const mailSubject = evt.title || "توصية قطاعية";
                                                          const mailBody = evt.preparationsText || "";
                                                          const a = document.createElement('a');
                                                          a.href = \`https://mail.google.com/mail/?view=cm&fs=1&su=\${encodeURIComponent(mailSubject)}&body=\${encodeURIComponent(mailBody)}\`;
                                                          a.target = '_blank';
                                                          a.rel = 'noopener noreferrer';
                                                          a.click();
                                                        }}`;

const replace = `                                                        onClick={() => {
                                                          let mailSubject = \`تفعيل \${evt.title || "توصية قطاعية"}\`;
                                                          let mailBody = evt.preparationsText || "";
                                                          if (mailBody.includes("سعادة")) {
                                                              mailBody = mailBody.substring(mailBody.indexOf("سعادة"));
                                                          } else if (mailBody.startsWith("الموضوع: ")) {
                                                              const firstLineEnd = mailBody.indexOf("\\n");
                                                              if (firstLineEnd !== -1) {
                                                                  mailBody = mailBody.substring(firstLineEnd + 1).trim();
                                                              }
                                                          }
                                                          
                                                          const atts = evt.attachments || [];
                                                          if (atts.length > 0) {
                                                              mailBody += "\\n\\nالمرفقات:\\n";
                                                              atts.forEach((a, idx) => {
                                                                  mailBody += \`\${idx + 1}- \${a.name}: \${a.url}\\n\`;
                                                              });
                                                          }

                                                          const a = document.createElement('a');
                                                          a.href = \`https://mail.google.com/mail/?view=cm&fs=1&su=\${encodeURIComponent(mailSubject)}&body=\${encodeURIComponent(mailBody)}\`;
                                                          a.target = '_blank';
                                                          a.rel = 'noopener noreferrer';
                                                          a.click();
                                                        }}`;

const files = ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  } else {
    console.log(`Could not find search string in ${file}`);
  }
}
