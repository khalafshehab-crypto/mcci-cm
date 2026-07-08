const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

// 1. Fix the title in newCustomRecs
content = content.replace(
  /title: evt\.title,/g,
  'title: `توصية البند: ${index + 1} - ${rec.title}`,'
);

// 2. Fix the assignee dropdown
content = content.replace(
  /<option key=\{m\.id\} value=\{\`\$\{m\.title\} \$\{m\.name\}\`\}>\{m\.title\} \{m\.name\} \(\{m\.role\}\)<\/option>/g,
  '<option key={m.id} value={`${m.role} - ${m.title} ${m.name}`}>{m.title} {m.name} ({m.role})</option>'
);

fs.writeFileSync('src/pages/CommitteesEvents.tsx', content, 'utf8');
console.log('Fixed export logic in CommitteesEvents');
