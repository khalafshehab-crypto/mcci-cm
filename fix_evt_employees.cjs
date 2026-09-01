const fs = require('fs');
const path = 'src/pages/CommitteesEvents.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/setNewEmployees\(evt\.employees\);/g, 'setNewEmployees(evt.employees || []);');
code = code.replace(/setSingleEmployee\(evt\.employees\[0\]/g, 'setSingleEmployee(evt.employees?.[0]');
code = code.replace(/setSeriesAssignedEmployee\(evt\.employees\[0\]/g, 'setSeriesAssignedEmployee(evt.employees?.[0]');
code = code.replace(/evt\.employees\.includes\(e\)/g, '(evt.employees || []).includes(e)');
code = code.replace(/evt\.employees\[0\] \|\| "غير محدد"/g, 'evt.employees?.[0] || "غير محدد"');

fs.writeFileSync(path, code);
console.log("Fixed evt.employees accesses.");
