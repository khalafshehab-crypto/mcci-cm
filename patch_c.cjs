const fs = require('fs');
let c = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');
const searchStart = "const mailSubject = evt.title || \"توصية قطاعية\";";
const searchEnd = "a.click();";

const startIdx = c.indexOf(searchStart);
const endIdx = c.indexOf(searchEnd, startIdx) + searchEnd.length;

if (startIdx !== -1) {
    const replaceStr = `let mailSubject = \`تفعيل \${evt.title || "توصية قطاعية"}\`;
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
                                                          a.click();`;
                                                          
    const finalContent = c.substring(0, startIdx) + replaceStr + c.substring(endIdx);
    fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', finalContent);
    console.log("Patched CommitteesRecommendations");
} else {
    console.log("Could not find block");
}
