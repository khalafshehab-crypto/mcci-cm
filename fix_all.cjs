const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// 1. Update State values
content = content.replace(
  'const [circularOutNumber, setCircularOutNumber] = useState(`46001025`);',
  'const [circularOutNumber, setCircularOutNumber] = useState(`15/45536242`);'
);
content = content.replace(
  'const [circularOutDate, setCircularOutDate] = useState(`1446-04-15`);',
  'const [circularOutDate, setCircularOutDate] = useState(`1447/04/20 هـ`);'
);
content = content.replace(
  'const [circularOutDate, setCircularOutDate] = useState(`1447/04/20 هـ`);', // wait, check if the hook exists first
  'const [circularOutDate, setCircularOutDate] = useState(`1447/04/20 هـ`);\n  const [circularTypes, setCircularTypes] = useState<string[]>([]);'
);

// 2. Add 'نوع التعميم' to the prompt
content = content.replace(
  'اسم المرفق: اسم مقترح للمرفق بناءً على الجهة المرسلة (مثل: خطاب اتحاد الغرف)\nعرض التعميم:',
  'اسم المرفق: اسم مقترح للمرفق بناءً على الجهة المرسلة (مثل: خطاب اتحاد الغرف)\nنوع التعميم: استخرج أو استنتج نوع/أهمية التعميم من الكلمات التالية إذا وجدت (عادي، هام، عاجل، سري). يمكن اختيار أكثر من واحد، افصل بينها بفاصلة. إذا لم يُذكر شيء اعتبره (عادي).\nعرض التعميم:'
);

// 3. Add to Regex
content = content.replace(
  'const attMatch = text.match(/اسم المرفق:\\s*(.*)/);',
  'const attMatch = text.match(/اسم المرفق:\\s*(.*)/);\n          const typeMatch = text.match(/نوع التعميم:\\s*(.*)/);'
);

content = content.replace(
  'if (attMatch && attMatch[1]) setCircularAttachmentName(attMatch[1].replace(/[*\[\\]]/g, \'\').trim());',
  'if (attMatch && attMatch[1]) setCircularAttachmentName(attMatch[1].replace(/[*\[\\]]/g, \'\').trim());\n          if (typeMatch && typeMatch[1]) {\n            const typesStr = typeMatch[1].replace(/[*\[\\]]/g, \'\').trim();\n            const parsedTypes = typesStr.split(/[،,]/).map(t => t.trim()).filter(t => t);\n            setCircularTypes(parsedTypes.length > 0 ? parsedTypes : ["عادي"]);\n          }'
);

// Write early to test
fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
