const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

content = content.replace(
  /title: \`توصية البند: \$\{rec\.title\}\`,/g,
  'title: `توصية البند ${getArabicOrdinal(index)} "${rec.title}"`,'
);

content = content.replace(
  /<span className="font-extrabold text-slate-950">توصية البند \{index \+ 1\}: \{rec\.recommendation\}<\/span>/g,
  '<span className="font-extrabold text-slate-950">توصية البند {getArabicOrdinal(index)} "{rec.title}"</span>'
);

fs.writeFileSync('src/pages/CommitteesEvents.tsx', content, 'utf8');
console.log('Fixed UI labels');
