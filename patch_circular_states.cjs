const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(/useState\("اتحاد الغرف السعودية"\);/g, 'useState("");');
content = content.replace(/useState\("ACS005681"\);/g, 'useState("");');
content = content.replace(/useState\("2025-10-12"\);/g, 'useState("");');
content = content.replace(/useState\("دعوة المهتمين للانضمام إلى عضوية مجلس الأعمال السعودي التايلاندي"\);/g, 'useState("");');
content = content.replace(/useState\("الأستاذ \/ محمد الصيعري"\);/g, 'useState("");');
content = content.replace(/useState\("0581517644"\);/g, 'useState("");');
content = content.replace(/useState\("malsaiari@fsc\.org\.sa"\);/g, 'useState("");');
content = content.replace(/useState\("خطاب اتحاد الغرف"\);/g, 'useState("");');
content = content.replace(/useState\(\`15\/45536242\`\);/g, 'useState("");');
content = content.replace(/useState\(\`1447\/04\/20 هـ\`\);/g, 'useState("");');

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
