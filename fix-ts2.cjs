const fs = require('fs');

let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const target = `{selectedEmployee?.committees?.map((comName, idx) => (
                  <div key={idx} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{comName}</span>
                    {currentUserRole === "SYS_ADMIN" && (
                      <button onClick={() => handleRemoveCommitteeFromEmployee(comName)} className="p-1 px-2 text-[10px] bg-red-50 text-red-650 rounded border border-red-100">إلغاء</button>
                    )}
                  </div>
                ))}`;

const replacement = `{selectedEmployee?.committees?.map((comName, idx) => (
                  <div key={idx} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{comName as string}</span>
                    {currentUserRole === "SYS_ADMIN" && (
                      <button onClick={() => handleRemoveCommitteeFromEmployee(comName as string)} className="p-1 px-2 text-[10px] bg-red-50 text-red-650 rounded border border-red-100">إلغاء</button>
                    )}
                  </div>
                ))}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/OrgChart.tsx', content);
