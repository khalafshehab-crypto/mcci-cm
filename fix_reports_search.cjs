const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  // 1. Add state variables
  const stateTarget = `  const [activeTab, setActiveTab] = useState<"reports" | "kpis">("reports");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");`;
  const stateReplace = `  const [activeTab, setActiveTab] = useState<"reports" | "kpis">("reports");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);`;
  
  code = code.replace(stateTarget, stateReplace);

  // 2. Add computed filtered variables
  const compTarget = `  const resetReportForm = () => {`;
  const compReplace = `  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (r.title || "").toLowerCase().includes(q) ||
           (r.generatedBy || "").toLowerCase().includes(q) ||
           (r.periodType || "").toLowerCase().includes(q) ||
           (r.generationType || "").toLowerCase().includes(q) ||
           (r.status || "").toLowerCase().includes(q) ||
           (r.notes || "").toLowerCase().includes(q) ||
           (r.date || "").toLowerCase().includes(q);
  });

  const filteredKpis = kpis.filter(k => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (k.indicator || "").toLowerCase().includes(q) ||
           (k.standard || "").toLowerCase().includes(q) ||
           (k.targetValue || "").toLowerCase().includes(q) ||
           (k.achievedValue || "").toLowerCase().includes(q) ||
           (k.period || "").toLowerCase().includes(q) ||
           (k.notes || "").toLowerCase().includes(q);
  });

  const resetReportForm = () => {`;
  code = code.replace(compTarget, compReplace);

  // 3. Add search UI to the header controls
  const searchUITarget = `<div className="relative flex bg-white p-1 rounded-xl border border-gray-200 select-none shadow-sm gap-1">`;
  const searchUIReplace = `<div className="flex items-center gap-2">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="ابحث هنا..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={\`p-2.5 rounded-xl transition-all duration-200 cursor-pointer border \${
                isSearchExpanded || searchQuery
                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }\`}
              title="البحث"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          <div className="relative flex bg-white p-1 rounded-xl border border-gray-200 select-none shadow-sm gap-1">`;
  
  code = code.replace(searchUITarget, searchUIReplace);

  // 4. Replace mapping
  code = code.replaceAll(`reports.map(`, `filteredReports.map(`);
  code = code.replaceAll(`kpis.map(`, `filteredKpis.map(`);
  code = code.replace(`reports.length === 0`, `filteredReports.length === 0`);
  code = code.replace(`kpis.length === 0`, `filteredKpis.length === 0`);

  fs.writeFileSync(filepath, code);
  console.log("Patched " + filepath);
}

patchFile('src/pages/CommitteesReports.tsx');
patchFile('src/pages/Reports.tsx');
