import os
import re

path = 'src/pages/AssistantSecGenEvents.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add referredFrom to EventItem
content = re.sub(r'(notes: string;)', r'\1\n  referredFrom?: string;', content)

# 2. Add allEmployeesList and modify dynamicEmployees
employees_code = """
  const allEmployeesList = React.useMemo(() => {
     const sourceList = dbEmployees.filter(e => 
         e && 
         e.role !== "SYS_ADMIN" &&
         e.id !== "01" && 
         e.name !== "شهاب الدين" && 
         e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
         e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com"
     );
     return sourceList.map(e => e.name).filter(Boolean);
  }, [dbEmployees]);

  const dynamicEmployees = React.useMemo(() => {
     const secs = allEmployeesList.filter(name => name.includes("سكرتير"));
     return secs.length > 0 ? secs : ["السكرتير"];
  }, [allEmployeesList]);
"""
content = re.sub(r'const dynamicEmployees = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[dbEmployees\]\);', employees_code.strip(), content)

# 3. Add states for referredFrom
state_code = """
  const [singleReferredFrom, setSingleReferredFrom] = useState("");
  const [seriesReferredFrom, setSeriesReferredFrom] = useState("");
"""
content = re.sub(r'(const \[singleEmployee, setSingleEmployee\] = useState[^;]*;)', r'\1\n  const [singleReferredFrom, setSingleReferredFrom] = useState("");', content)
content = re.sub(r'(const \[seriesAssignedEmployee, setSeriesAssignedEmployee\] = useState[^;]*;)', r'\1\n  const [seriesReferredFrom, setSeriesReferredFrom] = useState("");', content)

# 4. Update editing state
edit_state_code = """
      setSingleEmployee(ev.employees?.[0] || "");
      setSingleReferredFrom(ev.referredFrom || "");
"""
content = re.sub(r'setSingleEmployee\(ev\.employees\?\.\[0\] \|\| ""\);', edit_state_code.strip(), content)

# 5. Clear state
clear_code = """
    setSingleEmployee(dynamicEmployees[0] || "");
    setSingleReferredFrom("");
"""
content = re.sub(r'setSingleEmployee\(dynamicEmployees\[0\] \|\| ""\);', clear_code.strip(), content)

clear_series_code = """
    setSeriesAssignedEmployee(dynamicEmployees[0] || "");
    setSeriesReferredFrom("");
"""
content = re.sub(r'setSeriesAssignedEmployee\(dynamicEmployees\[0\] \|\| ""\);', clear_series_code.strip(), content)

# 6. Save event logic (single)
save_single_edit = """
        employees: [singleEmployee].filter(Boolean),
        referredFrom: singleReferredFrom,
"""
content = re.sub(r'employees: \[singleEmployee\]\.filter\(Boolean\),', save_single_edit.strip(), content)

save_single_new = """
          employees: [singleEmployee].filter(Boolean),
          referredFrom: singleReferredFrom,
"""
# Note: be careful here, it might match multiple places. Let's use re.sub cautiously.
content = re.sub(r'(location: singleRoom,\s*employees: \[singleEmployee\]\.filter\(Boolean\),)', r'\1\n        referredFrom: singleReferredFrom,', content)

# 7. Save event logic (series)
save_series_new = """
          employees: [seriesAssignedEmployee].filter(Boolean),
          referredFrom: seriesReferredFrom,
"""
content = re.sub(r'(location: selectedRoom || seriesRooms\[0\] || "",\s*employees: \[seriesAssignedEmployee\]\.filter\(Boolean\),)', r'\1\n          referredFrom: seriesReferredFrom,', content)

# 8. Add UI fields (single)
single_field = """
                          </div>
                          <div className="space-y-1 md:col-span-1">
                            <label className="text-[11px] font-black text-gray-500 block">محالة من</label>
                            <select
                              value={singleReferredFrom}
                              onChange={(e) => setSingleReferredFrom(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">تحديد الموظف...</option>
                              {allEmployeesList.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                            </select>
"""
content = re.sub(r'(<select\s*value=\{singleEmployee\}[\s\S]*?</select>\s*</div>)', r'\1' + single_field, content, count=1)

# 9. Add UI fields (series)
series_field = """
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">محالة من</label>
                            <select
                              value={seriesReferredFrom}
                              onChange={(e) => setSeriesReferredFrom(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">تحديد الموظف...</option>
                              {allEmployeesList.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                            </select>
"""
# Search for seriesAssignedEmployee select block and append
content = re.sub(r'(<select\s*value=\{seriesAssignedEmployee\}[\s\S]*?</select>\s*</div>)', r'\1' + series_field, content, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done part 7")
