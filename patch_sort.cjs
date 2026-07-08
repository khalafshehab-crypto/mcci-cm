const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesMembers.tsx',
  'src/pages/Members.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Add state
  content = content.replace(
    'const [isDeletingSelectedLoading, setIsDeletingSelectedLoading] = useState(false);',
    'const [isDeletingSelectedLoading, setIsDeletingSelectedLoading] = useState(false);\n  const [sortField, setSortField] = useState<"name" | "committeeName" | null>(null);\n  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");'
  );

  const handleSortDef = `  const handleSort = (field: "name" | "committeeName") => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredMembers = React.useMemo(() => {
    let result = members.filter(m => {
      const term = filterQuery.trim().toLowerCase();
      return !term ? true : (
        m.name.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term) ||
        m.committeeName.toLowerCase().includes(term) ||
        (m.entity || "").toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
      );
    });

    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = (a[sortField] || "").toLowerCase();
        const valB = (b[sortField] || "").toLowerCase();
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [members, filterQuery, sortField, sortDirection]);`;

  const oldFilteredMembers = `  const filteredMembers = members.filter(m => {
    const term = filterQuery.trim().toLowerCase();
    
    // Search query matches
    return !term ? true : (
      m.name.toLowerCase().includes(term) ||
      m.role.toLowerCase().includes(term) ||
      m.committeeName.toLowerCase().includes(term) ||
      (m.entity || "").toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term)
    );
  });`;

  content = content.replace(oldFilteredMembers, handleSortDef);

  // Add arrows icons to the table header
  const nameHeaderOld = `{visibleColumns.name && <th className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs w-[220px]">الاسم</th>}`;
  const nameHeaderNew = `{visibleColumns.name && (
                    <th 
                      className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs w-[220px] cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center justify-start gap-1">
                        الاسم
                        {sortField === "name" && (
                          <span className="text-brand">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                        {sortField !== "name" && <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>}
                      </div>
                    </th>
                  )}`;

  const committeeHeaderOld = `{visibleColumns.committee && <th className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs">اللجنة</th>}`;
  const committeeHeaderNew = `{visibleColumns.committee && (
                    <th 
                      className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort("committeeName")}
                    >
                      <div className="flex items-center justify-start gap-1">
                        اللجنة
                        {sortField === "committeeName" && (
                          <span className="text-brand">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                        {sortField !== "committeeName" && <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>}
                      </div>
                    </th>
                  )}`;
                  
  content = content.replace(nameHeaderOld, nameHeaderNew);
  content = content.replace(committeeHeaderOld, committeeHeaderNew);
  
  // also add group class to thead tr
  content = content.replace('<tr className="bg-[#dfba6b]/20 border-b border-[#dfba6b]/30">', '<tr className="bg-[#dfba6b]/20 border-b border-[#dfba6b]/30 group">');

  fs.writeFileSync(file, content);
}
console.log("Patched table sorting!");
