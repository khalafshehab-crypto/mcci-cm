const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

code = code.replace(/CheckSquare,/, "CheckSquare, RefreshCw,");
fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
