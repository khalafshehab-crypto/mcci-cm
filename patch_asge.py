import os
import re

path = 'src/pages/AssistantSecGenEvents.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update dynamicEmployees to just ["السكرتير"]
# Wait, "يظهر اختيار السكرتير في الموظف المختص". Is there a specific employee whose role is Secretary?
# Let's just use dbEmployees.filter for "سكرتير" or fallback to "السكرتير"
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

# 2. Add referredFrom to EventItem
content = re.sub(r'(notes: string;)', r'\1\n  referredFrom?: string;', content)

# 3. Add state variables for referredFrom
content = re.sub(r'(const \[singleEmployee, setSingleEmployee\] = useState.*?;)', r'\1\n  const [singleReferredFrom, setSingleReferredFrom] = useState("");', content)
content = re.sub(r'(const \[seriesAssignedEmployee, setSeriesAssignedEmployee\] = useState.*?;)', r'\1\n  const [seriesReferredFrom, setSeriesReferredFrom] = useState("");', content)

# 4. Update editing state
edit_state_code = """
      setSingleEmployee(ev.employees?.[0] || "");
      setSingleReferredFrom(ev.referredFrom || "");
"""
content = re.sub(r'setSingleEmployee\(ev\.employees\?\.\[0\] \|\| ""\);', edit_state_code.strip(), content)

# 5. Clear state
content = re.sub(r'(setSingleEmployee\(dynamicEmployees\[0\] \|\| ""\);)', r'\1\n    setSingleReferredFrom("");', content)
content = re.sub(r'(setSeriesAssignedEmployee\(dynamicEmployees\[0\] \|\| ""\);)', r'\1\n    setSeriesReferredFrom("");', content)

# 6. Save event logic (single)
content = re.sub(r'(employees: \[singleEmployee\]\.filter\(Boolean\),)', r'\1\n        referredFrom: singleReferredFrom,', content)

# 7. Save event logic (series)
content = re.sub(r'(employees: \[seriesAssignedEmployee\]\.filter\(Boolean\),)', r'\1\n          referredFrom: seriesReferredFrom,', content)

# 8. UI fields
# We need to find the specific select blocks.
# In AssistantSecGenEvents.tsx, let's just append the new select block after the singleEmployee one.
single_field = """
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">محالة من</label>
                            <select
                              value={singleReferredFrom}
                              onChange={(e) => setSingleReferredFrom(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">تحديد الموظف...</option>
                              {allEmployeesList.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                            </select>
                          </div>
"""
# find the end of the div containing singleEmployee
content = re.sub(r'(<select\s*value=\{singleEmployee\}[\s\S]*?</select>\s*</div>)', r'\1\n' + single_field, content, count=1)

series_field = """
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
                          </div>
"""
content = re.sub(r'(<select\s*value=\{seriesAssignedEmployee\}[\s\S]*?</select>\s*</div>)', r'\1\n' + series_field, content, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done patching AssistantSecGenEvents.tsx")
