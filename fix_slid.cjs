const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');
code = code.replace('<SlidersHorizontal,\n  ChevronDown className="w-3.5 h-3.5" />', '<SlidersHorizontal className="w-3.5 h-3.5" />');
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
