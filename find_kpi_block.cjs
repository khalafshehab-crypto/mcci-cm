const fs = require('fs');
const path = 'src/pages/CommitteesReports.tsx';
let code = fs.readFileSync(path, 'utf8');

const kpiStartStr = '{activeTab === "kpis" && (';
const kpiStartIdx = code.indexOf(kpiStartStr);
console.log(code.substring(kpiStartIdx, kpiStartIdx + 300));
