const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const originalAssignDeptSelect = `<select
                        value={selectedAssignDept}
                        onChange={(e) => {
                          setSelectedAssignDept(e.target.value);
                          const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === e.target.value || emp.orgLevel2 === e.target.value || emp.orgLevel1 === e.target.value);
                          if (deptEmps.length > 0) {
                            setAssignedTo(deptEmps[0].name);
                          } else {
                            setAssignedTo("");
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean))).map((dept, i) => (
                          <option key={i} value={dept as string}>{dept as string}</option>
                        ))}
                      </select>`;

const replacementAssignDeptSelect = `<select
                        value={selectedAssignDept}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedAssignDept(val);
                          const deptEmps = val ? allEmployeesData.filter(emp => emp.orgLevel3 === val || emp.orgLevel2 === val || emp.orgLevel1 === val) : allEmployeesData;
                          if (deptEmps.length > 0) {
                            setAssignedTo(deptEmps[0].name);
                          } else {
                            setAssignedTo("");
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">-- جميع الإدارات --</option>
                        {Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean))).map((dept, i) => (
                          <option key={i} value={dept as string}>{dept as string}</option>
                        ))}
                      </select>`;

if(code.includes(originalAssignDeptSelect)) {
    code = code.replace(originalAssignDeptSelect, replacementAssignDeptSelect);
    console.log("Replaced selectedAssignDept select 1");
}

const originalAssignToSelect = `<select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {allEmployeesData.filter(emp => emp.orgLevel3 === selectedAssignDept || emp.orgLevel2 === selectedAssignDept || emp.orgLevel1 === selectedAssignDept).map((e, i) => (
                          <option key={i} value={e.name}>{e.name}</option>
                        ))}
                      </select>`;

const replacementAssignToSelect = `<select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">-- اختر الموظف --</option>
                        {allEmployeesData.filter(emp => selectedAssignDept ? (emp.orgLevel3 === selectedAssignDept || emp.orgLevel2 === selectedAssignDept || emp.orgLevel1 === selectedAssignDept) : true).map((e, i) => (
                          <option key={i} value={e.name}>{e.name}</option>
                        ))}
                      </select>`;

if(code.includes(originalAssignToSelect)) {
    code = code.replace(originalAssignToSelect, replacementAssignToSelect);
    // Note: since this appears twice (once in Add, once in Edit), replace both
    code = code.replace(originalAssignToSelect, replacementAssignToSelect);
    console.log("Replaced assignedTo selects");
}

fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
