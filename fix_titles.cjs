const fs = require('fs');
['src/pages/AssistantSecGen.tsx', 'src/pages/Centers.tsx', 'src/pages/Affiliates.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (file.includes('AssistantSecGen')) {
    content = content.replace(/لوحة تحكم إدارة اللجان/g, 'شاشة متابعة مساعد الأمين العام');
  } else if (file.includes('Centers')) {
    content = content.replace(/لوحة تحكم إدارة اللجان/g, 'شاشة متابعة إدارة المراكز');
  } else if (file.includes('Affiliates')) {
    content = content.replace(/لوحة تحكم إدارة اللجان/g, 'شاشة متابعة إدارة المنتسبين');
  }
  fs.writeFileSync(file, content);
});
