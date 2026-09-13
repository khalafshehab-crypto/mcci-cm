const fs = require('fs');
let c = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

c = c.replace(
  /const assignedEmp = dbEmployees\.find\(emp =>[\s\S]*?\);/,
  `const assignedEmp = dbEmployees.find(emp => 
        emp && emp.active && (
            (emp.committees && emp.committees.includes(comm.name)) ||
            emp.orgLevel1 === comm.name || 
            emp.orgLevel2 === comm.name || 
            emp.orgLevel3 === comm.name || 
            emp.orgLevel4 === comm.name || 
            emp.orgLevel5 === comm.name
        )
     );`
);

fs.writeFileSync('src/pages/CentersEvents.tsx', c);
