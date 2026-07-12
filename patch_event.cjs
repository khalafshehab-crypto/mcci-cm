const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

code = code.replace(
  'hasImpact?: boolean;\n    workDays?: number;\n  }>;',
  'hasImpact?: boolean;\n    workDays?: number;\n    inactiveRecommendation?: boolean;\n  }>;'
);
fs.writeFileSync('src/pages/CommitteesEvents.tsx', code);
