const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// 1. Add new state for the Columns Menu
code = code.replace(
  `const [isExportOpen, setIsExportOpen] = useState(false);`,
  `const [isExportOpen, setIsExportOpen] = useState(false);\n  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);`
);

// 2. Make the table columns conditional based on selectedExportFields
code = code.replace(
  `<th className="whitespace-nowrap px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">رئيس اللجنة</th>`,
  `{selectedExportFields.includes("president") && <th className="whitespace-nowrap px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">رئيس اللجنة</th>}`
);
code = code.replace(
  `<th className="whitespace-nowrap px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">الأخصائي</th>`,
  `{selectedExportFields.includes("specialist") && <th className="whitespace-nowrap px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">الأخصائي</th>}`
);
code = code.replace(
  `<th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الأعضاء</th>`,
  `{selectedExportFields.includes("membersCount") && <th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الأعضاء</th>}`
);
code = code.replace(
  `<th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الاجتماعات</th>`,
  `{selectedExportFields.includes("meetingsCount") && <th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الاجتماعات</th>}`
);
code = code.replace(
  `<th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">التوصيات</th>`,
  `{selectedExportFields.includes("recommendationsCount") && <th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">التوصيات</th>}`
);
code = code.replace(
  `<th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الفعاليات</th>`,
  `{selectedExportFields.includes("eventsCount") && <th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الفعاليات</th>}`
);
code = code.replace(
  `<th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-850 tracking-tight text-xs w-32">الخطة الاستراتيجية</th>`,
  `{selectedExportFields.includes("strategicPlan") && <th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-850 tracking-tight text-xs w-32">الخطة الاستراتيجية</th>}`
);
code = code.replace(
  `<th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-850 tracking-tight text-xs w-24">الحالة</th>`,
  `{selectedExportFields.includes("status") && <th className="whitespace-nowrap px-3 py-3 font-black text-center text-gray-850 tracking-tight text-xs w-24">الحالة</th>}`
);

// Body columns
code = code.replace(
  `{/* President */}\n                    <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-gray-800">\n                      {comm.president || "-"}\n                    </td>`,
  `{/* President */}\n                    {selectedExportFields.includes("president") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-gray-800">\n                      {comm.president || "-"}\n                    </td>\n                    )}`
);
code = code.replace(
  `{/* Specialist */}\n                    <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-gray-800">\n                      {comm.specialist || "-"}\n                    </td>`,
  `{/* Specialist */}\n                    {selectedExportFields.includes("specialist") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-gray-800">\n                      {comm.specialist || "-"}\n                    </td>\n                    )}`
);
code = code.replace(
  `{/* Member Count */}\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-gray-900 font-mono whitespace-nowrap">\n                      {comm.membersCount}\n                    </td>`,
  `{/* Member Count */}\n                    {selectedExportFields.includes("membersCount") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-gray-900 font-mono whitespace-nowrap">\n                      {comm.membersCount}\n                    </td>\n                    )}`
);
code = code.replace(
  `{/* Meetings Count */}\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-gray-950 font-mono whitespace-nowrap">\n                      {comm.meetingsCount}\n                    </td>`,
  `{/* Meetings Count */}\n                    {selectedExportFields.includes("meetingsCount") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-gray-950 font-mono whitespace-nowrap">\n                      {comm.meetingsCount}\n                    </td>\n                    )}`
);
code = code.replace(
  `{/* Recommendations */}\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-emerald-700 font-mono whitespace-nowrap">\n                      {comm.recommendationsCount || 0}\n                    </td>`,
  `{/* Recommendations */}\n                    {selectedExportFields.includes("recommendationsCount") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-emerald-700 font-mono whitespace-nowrap">\n                      {comm.recommendationsCount || 0}\n                    </td>\n                    )}`
);
code = code.replace(
  `{/* Events */}\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-purple-700 font-mono whitespace-nowrap">\n                      {comm.eventsCount || 0}\n                    </td>`,
  `{/* Events */}\n                    {selectedExportFields.includes("eventsCount") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center text-purple-700 font-mono whitespace-nowrap">\n                      {comm.eventsCount || 0}\n                    </td>\n                    )}`
);
code = code.replace(
  `{/* Strategic Plan */}\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center whitespace-nowrap">\n                      {comm.strategicPlan ? (\n                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-150">\n                          {comm.strategicPlan}\n                        </span>\n                      ) : (\n                        <span className="text-[10px] text-gray-400 font-bold">غير مدرج</span>\n                      )}\n                    </td>`,
  `{/* Strategic Plan */}\n                    {selectedExportFields.includes("strategicPlan") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center whitespace-nowrap">\n                      {comm.strategicPlan ? (\n                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-150">\n                          {comm.strategicPlan}\n                        </span>\n                      ) : (\n                        <span className="text-[10px] text-gray-400 font-bold">غير مدرج</span>\n                      )}\n                    </td>\n                    )}`
);
code = code.replace(
  `{/* Status badge representing Active vs Inactive */}\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center whitespace-nowrap">\n                      <span className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black \${\n                        comm.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"\n                      }\`}>\n                        <span className={\`w-1.5 h-1.5 rounded-full \${comm.active ? "bg-emerald-500" : "bg-rose-500"}\`}></span>\n                        {comm.active ? "نشطة" : "غير نشطة"}\n                      </span>\n                    </td>`,
  `{/* Status badge representing Active vs Inactive */}\n                    {selectedExportFields.includes("status") && (\n                    <td className="whitespace-nowrap px-4 py-3.5 text-center whitespace-nowrap">\n                      <span className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black \${\n                        comm.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"\n                      }\`}>\n                        <span className={\`w-1.5 h-1.5 rounded-full \${comm.active ? "bg-emerald-500" : "bg-rose-500"}\`}></span>\n                        {comm.active ? "نشطة" : "غير نشطة"}\n                      </span>\n                    </td>\n                    )}`
);

// 3. Add the Columns toggle button and dropdown
const columnsButton = `
          {/* Columns Selector Dropdown */}
          <div className="relative dropdown-container">
            <button
              type="button"
              onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
              className="h-10 px-3 bg-white hover:bg-gray-50 text-gray-700 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer"
              title="إظهار/إخفاء الأعمدة"
            >
              <Columns className="w-4 h-4" />
              <span>الأعمدة</span>
            </button>
            <AnimatePresence>
              {isColumnsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-right"
                >
                  <div className="px-4 py-2 border-b border-gray-100 mb-2">
                    <h4 className="font-extrabold text-xs text-gray-800">الأعمدة الظاهرة</h4>
                    <p className="text-[10px] text-gray-500 font-medium">اختر الأعمدة لعرضها وتصديرها</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                    {EXPORT_FIELDS_META.filter(f => !["alphabetical", "desc", "notes"].includes(f.key)).map(f => (
                      <label key={f.key} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedExportFields.includes(f.key)}
                          onChange={() => toggleExportField(f.key)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-[11px] font-extrabold text-gray-700 select-none">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
`;

code = code.replace(
  `{/* Google Sheets Export Button */}`,
  columnsButton + `\n          {/* Google Sheets Export Button */}`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
