const fs = require('fs');

const file = 'src/pages/OrgChart.tsx';
let content = fs.readFileSync(file, 'utf8');

const groupingLogicStart = `
                  {Object.entries(
                    safeDbEmployees.reduce((acc, emp) => {
                      const dept = emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1 || "أخرى";
                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(emp);
                      return acc;
                    }, {} as Record<string, typeof safeDbEmployees>)
                  ).map(([dept, emps]) => (
                    <React.Fragment key={dept}>
                      <tr className="bg-gray-100">
                        <td colSpan={23} className="p-2 font-black text-xs text-gray-800 border-y border-gray-200">
                          {dept} <span className="text-[10px] text-gray-500 font-bold ml-2">({emps.length} موظف)</span>
                        </td>
                      </tr>
                      {emps.map((emp) => {
`;

content = content.replace(
  /\{safeDbEmployees\.map\(\(emp\) => \{/g,
  groupingLogicStart
);

content = content.replace(
  /                    \)\n                  \}\)\}\n                <\/tbody>/g,
  `                    )
                  })}
                  </React.Fragment>
                  ))}
                </tbody>`
);

fs.writeFileSync(file, content);
console.log("Done");
