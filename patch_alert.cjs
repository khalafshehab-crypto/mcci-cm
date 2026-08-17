const fs = require('fs');

const search = `                                                          if (fullUrl.length > 2000) {
                                                              navigator.clipboard.writeText(mailBody).then(() => {
                                                                  alert("نظراً لطول محتوى الرسالة وتجاوزه الحد المسموح به في المتصفح، تم نسخ المحتوى للحافظة تلقائياً.\\n\\nيرجى لصق (Ctrl+V) المحتوى في نافذة الإيميل التي ستفتح الآن.");
                                                                  const a = document.createElement('a');
                                                                  a.href = \`https://mail.google.com/mail/?view=cm&fs=1&su=\${encodeURIComponent(mailSubject)}&body=\${encodeURIComponent("يرجى لصق محتوى الرسالة هنا (Ctrl + V)...")}\`;
                                                                  a.target = '_blank';
                                                                  a.rel = 'noopener noreferrer';
                                                                  a.click();
                                                              });
                                                          } else {`;

const replace = `                                                          if (fullUrl.length > 2000) {
                                                              navigator.clipboard.writeText(mailBody).then(() => {
                                                                  showGlobalToast("نظراً لطول محتوى الرسالة، تم نسخ المحتوى للحافظة. يرجى الضغط على لصق (Ctrl+V) في مساحة النص بالبريد.", "success");
                                                                  setTimeout(() => {
                                                                      const a = document.createElement('a');
                                                                      a.href = \`https://mail.google.com/mail/?view=cm&fs=1&su=\${encodeURIComponent(mailSubject)}&body=\`;
                                                                      a.target = '_blank';
                                                                      a.rel = 'noopener noreferrer';
                                                                      a.click();
                                                                  }, 2000);
                                                              });
                                                          } else {`;

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
