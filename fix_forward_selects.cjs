const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const originalForwardDeptSelect = `<select
                          value={forwardAssignDept}
                          onChange={(e) => {
                            setForwardAssignDept(e.target.value);
                            const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === e.target.value || emp.orgLevel2 === e.target.value || emp.orgLevel1 === e.target.value);
                            if (deptEmps.length > 0) {
                              setForwardAssignTo(deptEmps[0].name);
                            } else {
                              setForwardAssignTo("");
                            }
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          {Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean))).map((dept, i) => (
                            <option key={i} value={dept as string}>{dept as string}</option>
                          ))}
                        </select>`;

const replacementForwardDeptSelect = `<select
                          value={forwardAssignDept}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForwardAssignDept(val);
                            const deptEmps = val ? allEmployeesData.filter(emp => emp.orgLevel3 === val || emp.orgLevel2 === val || emp.orgLevel1 === val) : allEmployeesData;
                            if (deptEmps.length > 0) {
                              setForwardAssignTo(deptEmps[0].name);
                            } else {
                              setForwardAssignTo("");
                            }
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="">-- جميع الإدارات --</option>
                          {Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean))).map((dept, i) => (
                            <option key={i} value={dept as string}>{dept as string}</option>
                          ))}
                        </select>`;

if(code.includes(originalForwardDeptSelect)) {
    code = code.replace(originalForwardDeptSelect, replacementForwardDeptSelect);
    console.log("Replaced forwardAssignDept select");
}

const originalForwardToSelect = `<select
                          value={forwardAssignTo}
                          onChange={(e) => setForwardAssignTo(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          {allEmployeesData.filter(emp => emp.orgLevel3 === forwardAssignDept || emp.orgLevel2 === forwardAssignDept || emp.orgLevel1 === forwardAssignDept).map((e, i) => (
                            <option key={i} value={e.name}>{e.name}</option>
                          ))}
                        </select>`;

const replacementForwardToSelect = `<select
                          value={forwardAssignTo}
                          onChange={(e) => setForwardAssignTo(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="">-- اختر الموظف --</option>
                          {allEmployeesData.filter(emp => forwardAssignDept ? (emp.orgLevel3 === forwardAssignDept || emp.orgLevel2 === forwardAssignDept || emp.orgLevel1 === forwardAssignDept) : true).map((e, i) => (
                            <option key={i} value={e.name}>{e.name}</option>
                          ))}
                        </select>`;

if(code.includes(originalForwardToSelect)) {
    code = code.replace(originalForwardToSelect, replacementForwardToSelect);
    console.log("Replaced forwardAssignTo select");
}

fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
