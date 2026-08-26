const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

// Add to ReportItem interface
code = code.replace(
    'completedTasksCount?: number;',
    'completedTasksCount?: number;\n    reportsCount?: number;'
);

// Add to re-scan
code = code.replace(
    'completedTasksCount: Math.round(freshItems.length / 3)',
    'completedTasksCount: Math.round(freshItems.length / 3),\n          reportsCount: Math.round(freshItems.length / 3)'
);

// Add to initial scan stats
code = code.replace(
    'completedTasksCount: detailedItems.filter(i => i.category === \'task\' && (i.status === "منجزة" || i.status === "مكتملة")).length',
    'completedTasksCount: detailedItems.filter(i => i.category === \'task\' && (i.status === "منجزة" || i.status === "مكتملة")).length,\n          reportsCount: detailedItems.filter(i => i.category === \'report\').length'
);

// Add to UI
const uiStatsFind = `<div className="flex justify-between items-center border-t border-indigo-100/50 pt-1 mt-1">
                              <span className="text-gray-600 font-bold">المهام المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedTasksCount || 0}</span>
                            </div>`;
const uiStatsReplace = `<div className="flex justify-between items-center border-t border-indigo-100/50 pt-1 mt-1">
                              <span className="text-gray-600 font-bold">التقارير الصادرة:</span>
                              <span className="font-black text-blue-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.reportsCount || 0}</span>
                            </div>`;

if (code.includes('المهام المنجزة:')) {
   code = code.replace(uiStatsFind, uiStatsFind + '\n                            ' + uiStatsReplace);
}

fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched UI stats 2");
