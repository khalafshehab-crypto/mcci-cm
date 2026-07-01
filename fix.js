const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(/renderEmployeesForNode\(dbEmployees/g, 'renderEmployeesForNode(safeDbEmployees');
code = code.replace(/<span>\{dbEmployees\.filter/g, '<span>{safeDbEmployees.filter');

fs.writeFileSync('src/pages/OrgChart.tsx', code);
console.log('Fixed!');
