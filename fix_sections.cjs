const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(
  /\.filter\(e => e\.orgLevel4 === sec\.name && e\.orgLevel5\)/,
  '.filter(e => e.orgLevel4 === sec.name && e.orgLevel5 && e.role !== "DEPT_HEAD" && e.role !== "MANAG_DIR")'
);

code = code.replace(
  /\{renderEmployeesForNode\(safeDbEmployees\.filter\(e => e\.orgLevel4 === sec\.name && !e\.orgLevel5\)\)\}/,
  '{renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel4 === sec.name && (!e.orgLevel5 || e.role === "DEPT_HEAD" || e.role === "MANAG_DIR")))}'
);

code = code.replace(
  /\{renderEmployeesForNode\(safeDbEmployees\.filter\(e => e\.orgLevel4 === sec\.name && e\.orgLevel5 === job\.name\)\)\}/,
  '{renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel4 === sec.name && e.orgLevel5 === job.name && e.role !== "DEPT_HEAD" && e.role !== "MANAG_DIR"))}'
);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
console.log('Fixed Level 4!');
