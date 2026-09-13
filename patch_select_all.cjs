const fs = require('fs');

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Add allEmployeesNames calculation
  if (!content.includes('const allEmployeesNames =')) {
    content = content.replace(
      /return grouped;\n\s*\},\s*\[dbEmployees\]\);/,
      `return grouped;
  }, [dbEmployees]);

  const allEmployeesNames = React.useMemo(() => {
    return dbEmployees.filter((e: any) => e && e.role !== "SYS_ADMIN" && e.id !== "01" && e.name !== "شهاب الدين" && e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && e.active).map((e: any) => e.name);
  }, [dbEmployees]);`
    );
  }

  // Update Employees Dropdown (Single)
  content = content.replace(
    /\{Object\.entries\(allGroupedEmployees\)\.map\(\(\[group, emps\]: \[string, any\]\) => \(/,
    `<div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                      if (singleAdditionalInvitees.length === allEmployeesNames.length) {
                                        setSingleAdditionalInvitees([]);
                                      } else {
                                        setSingleAdditionalInvitees(allEmployeesNames);
                                      }
                                    }}>
                                      <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                      <input type="checkbox" checked={singleAdditionalInvitees.length === allEmployeesNames.length && allEmployeesNames.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                    </div>
                                    {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (`
  );

  // Update Members Dropdown (Single)
  content = content.replace(
    /\{committeeMembers\.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة<\/div>\}\n\s*\{committeeMembers\.map\(\(m: any\) => \(/,
    `{committeeMembers.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة</div>}
                                    {committeeMembers.length > 0 && (
                                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                        if (newMembers.length === committeeMembers.length) {
                                          setNewMembers([]);
                                        } else {
                                          setNewMembers(committeeMembers.map((m: any) => m.id));
                                        }
                                      }}>
                                        <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                        <input type="checkbox" checked={newMembers.length === committeeMembers.length && committeeMembers.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                      </div>
                                    )}
                                    {committeeMembers.map((m: any) => (`
  );

  // Update Employees Dropdown (Series)
  content = content.replace(
    /\{Object\.entries\(allGroupedEmployees\)\.map\(\(\[group, emps\]: \[string, any\]\) => \(/,
    `<div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                      if (seriesAdditionalInvitees.length === allEmployeesNames.length) {
                                        setSeriesAdditionalInvitees([]);
                                      } else {
                                        setSeriesAdditionalInvitees(allEmployeesNames);
                                      }
                                    }}>
                                      <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                      <input type="checkbox" checked={seriesAdditionalInvitees.length === allEmployeesNames.length && allEmployeesNames.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                    </div>
                                    {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (`
  );

  // Update Members Dropdown (Series)
  content = content.replace(
    /\{committeeMembers\.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة<\/div>\}\n\s*\{committeeMembers\.map\(\(m: any\) => \(/,
    `{committeeMembers.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة</div>}
                                    {committeeMembers.length > 0 && (
                                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                        if (newMembers.length === committeeMembers.length) {
                                          setNewMembers([]);
                                        } else {
                                          setNewMembers(committeeMembers.map((m: any) => m.id));
                                        }
                                      }}>
                                        <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                        <input type="checkbox" checked={newMembers.length === committeeMembers.length && committeeMembers.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                      </div>
                                    )}
                                    {committeeMembers.map((m: any) => (`
  );

  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}
