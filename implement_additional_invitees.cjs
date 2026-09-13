const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Insert State
  if (!code.includes('const [singleAdditionalInvitees')) {
    const stateHookStr = `const [singleEmployee, setSingleEmployee] = useState(currentUser?.name || "");`;
    const newStates = `const [singleEmployee, setSingleEmployee] = useState(currentUser?.name || "");
  const [singleAdditionalInvitees, setSingleAdditionalInvitees] = useState<string[]>([]);
  const [seriesAdditionalInvitees, setSeriesAdditionalInvitees] = useState<string[]>([]);
  const [isSingleInviteesOpen, setIsSingleInviteesOpen] = useState(false);
  const [isSeriesInviteesOpen, setIsSeriesInviteesOpen] = useState(false);
  
  const allGroupedEmployees = React.useMemo(() => {
    const list = dbEmployees.filter((e: any) => 
      e && e.role !== "SYS_ADMIN" && e.id !== "01" && e.name !== "شهاب الدين" && e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && e.active
    );
    const grouped = list.reduce((acc: any, emp: any) => {
      const groupName = emp.orgLevel3 || emp.orgLevel2 || "أخرى";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push({ name: emp.name, email: emp.email });
      return acc;
    }, {});
    return grouped;
  }, [dbEmployees]);`;
    code = code.replace(stateHookStr, newStates);
  }

  // 2. Populate singleAdditionalInvitees when editing
  const editHookStr = `setSingleEmployee(evt.employees?.[0] || "");`;
  if (code.includes(editHookStr) && !code.includes('setSingleAdditionalInvitees(evt.employees?.slice(1) || [])')) {
      code = code.replace(editHookStr, `setSingleEmployee(evt.employees?.[0] || "");\n    setSingleAdditionalInvitees(evt.employees?.slice(1) || []);`);
  }

  // 3. Clear them when adding new
  const addHookStr = `setSingleEmployee(currentUser?.name || "");`;
  if (code.includes(addHookStr) && !code.includes('setSingleAdditionalInvitees([])')) {
      // It might be inside handleAddEvent or similar
      // let's just do a regex replace
      code = code.replace(/setSingleEmployee\(currentUser\?\.name \|\| ""\);/g, `setSingleEmployee(currentUser?.name || "");\n    setSingleAdditionalInvitees([]);\n    setSeriesAdditionalInvitees([]);`);
  }

  // 4. Update Save single event
  // employees: [singleEmployee].filter(Boolean),
  code = code.replace(/employees: \[singleEmployee\]\.filter\(Boolean\),/g, `employees: [singleEmployee, ...singleAdditionalInvitees].filter(Boolean),`);
  
  // 5. Update Save series event
  // employees: [seriesAssignedEmployee].filter(Boolean),
  code = code.replace(/employees: \[seriesAssignedEmployee\]\.filter\(Boolean\),/g, `employees: [seriesAssignedEmployee, ...seriesAdditionalInvitees].filter(Boolean),`);
  
  // Update checkConflict call for series
  // [seriesAssignedEmployee].filter(Boolean)
  code = code.replace(/\[seriesAssignedEmployee\]\.filter\(Boolean\)/g, `[seriesAssignedEmployee, ...seriesAdditionalInvitees].filter(Boolean)`);


  // 6. Inject UI for Single Event
  // We look for:
  // <div className="space-y-1 md:col-span-1">
  //   <label className="text-[11px] font-black text-gray-500 block">القاعة *</label>
  const singleRoomStr = `<label className="text-[11px] font-black text-gray-500 block">القاعة *</label>`;
  
  // Let's find the closing div of singleRoom block and inject after it
  const singleInviteesUI = `
                          {/* Additional Invitees Single */}
                          <div className="space-y-1 md:col-span-3 relative">
                            <label className="text-[11px] font-black text-gray-500 block">دعوات إضافية (أخرى)</label>
                            <div 
                              onClick={() => setIsSingleInviteesOpen(!isSingleInviteesOpen)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                            >
                              {singleAdditionalInvitees.length === 0 && <span className="text-gray-400">اختر موظفين لإضافتهم...</span>}
                              {singleAdditionalInvitees.map(name => (
                                <span key={name} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                  {name}
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setSingleAdditionalInvitees(prev => prev.filter(p => p !== name)); }} className="hover:text-blue-900"><X className="w-3 h-3"/></button>
                                </span>
                              ))}
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                            {isSingleInviteesOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (
                                  <div key={group}>
                                    <div className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-600 border-y border-gray-200 sticky top-0 z-10">{group}</div>
                                    {emps.map((emp: any) => (
                                      <label key={emp.name} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                        <input type="checkbox" checked={singleAdditionalInvitees.includes(emp.name)} 
                                          onChange={(e) => {
                                            if (e.target.checked) setSingleAdditionalInvitees(prev => [...prev, emp.name]);
                                            else setSingleAdditionalInvitees(prev => prev.filter(p => p !== emp.name));
                                          }}
                                        className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                        <span className="text-xs font-semibold text-gray-800">{emp.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>`;

  if (!code.includes('{/* Additional Invitees Single */}')) {
      const roomIndex = code.indexOf(singleRoomStr);
      if (roomIndex !== -1) {
          const selectEndIndex = code.indexOf('</select>', roomIndex);
          const divEndIndex = code.indexOf('</div>', selectEndIndex);
          code = code.substring(0, divEndIndex + 6) + singleInviteesUI + code.substring(divEndIndex + 6);
      }
  }

  // 7. Inject UI for Series Event
  // We look for: <label className="text-[11px] font-black text-gray-500 block">الموظف المعني</label>
  const seriesEmpStr = `<label className="text-[11px] font-black text-gray-500 block">الموظف المعني</label>`;
  
  const seriesInviteesUI = `
                          {/* Additional Invitees Series */}
                          <div className="space-y-1 md:col-span-3 relative">
                            <label className="text-[11px] font-black text-gray-500 block">دعوات إضافية (أخرى)</label>
                            <div 
                              onClick={() => setIsSeriesInviteesOpen(!isSeriesInviteesOpen)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                            >
                              {seriesAdditionalInvitees.length === 0 && <span className="text-gray-400">اختر موظفين لإضافتهم...</span>}
                              {seriesAdditionalInvitees.map(name => (
                                <span key={name} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                  {name}
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setSeriesAdditionalInvitees(prev => prev.filter(p => p !== name)); }} className="hover:text-blue-900"><X className="w-3 h-3"/></button>
                                </span>
                              ))}
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                            {isSeriesInviteesOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (
                                  <div key={group}>
                                    <div className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-600 border-y border-gray-200 sticky top-0 z-10">{group}</div>
                                    {emps.map((emp: any) => (
                                      <label key={emp.name} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                        <input type="checkbox" checked={seriesAdditionalInvitees.includes(emp.name)} 
                                          onChange={(e) => {
                                            if (e.target.checked) setSeriesAdditionalInvitees(prev => [...prev, emp.name]);
                                            else setSeriesAdditionalInvitees(prev => prev.filter(p => p !== emp.name));
                                          }}
                                        className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                        <span className="text-xs font-semibold text-gray-800">{emp.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>`;

  if (!code.includes('{/* Additional Invitees Series */}')) {
      const sEmpIndex = code.indexOf(seriesEmpStr);
      if (sEmpIndex !== -1) {
          const selectEndIndex = code.indexOf('</select>', sEmpIndex);
          const divEndIndex = code.indexOf('</div>', selectEndIndex);
          code = code.substring(0, divEndIndex + 6) + seriesInviteesUI + code.substring(divEndIndex + 6);
      }
  }

  // Also import ChevronDown if not present
  if (code.includes('ChevronDown') && !code.includes('ChevronDown') /* This logic is flawed, let's regex the import */) {
    // skip, Lucide react usually has what we need or we can rely on standard icons
  }
  if (!code.includes('ChevronDown,')) {
      code = code.replace(/import \{([\s\S]*?)\} from "lucide-react";/, (match, p1) => {
         if (!p1.includes('ChevronDown')) return `import { ChevronDown, ${p1} } from "lucide-react";`;
         return match;
      });
  }

  fs.writeFileSync(file, code);
  console.log("Updated", file);
}
