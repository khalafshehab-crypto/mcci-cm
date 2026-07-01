const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const newRenderEmployees = `const renderEmployeesForNode = (employees: Employee[]) => {
    if (employees.length === 0) return null;
    
    const rolePriority: Record<string, number> = {
      SYS_ADMIN: 1,
      SECRETARY_GENERAL: 2,
      EXECUTIVE_OFFICE: 3,
      ASSISTANT_SEC_GEN: 4,
      MANAG_DIR: 5,
      DEPT_HEAD: 6,
      SPECIALIST: 7,
      SECRETARY: 8
    };

    const sortedEmployees = [...employees].sort((a, b) => {
      const aPriority = rolePriority[a.role] || 99;
      const bPriority = rolePriority[b.role] || 99;
      return aPriority - bPriority;
    });

    return (
      <div className="mt-2 flex flex-col gap-1 w-full px-1 z-30 relative">
        {sortedEmployees.map(emp => (`

code = code.replace(
  /const renderEmployeesForNode = \(employees: Employee\[\]\) => \{\s*if \(employees\.length === 0\) return null;\s*return \(\s*<div className="mt-2 flex flex-col gap-1 w-full px-1 z-30 relative">\s*\{employees\.map\(emp => \(/,
  newRenderEmployees
);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
console.log('Fixed renderEmployeesForNode!');
