const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

// Add tasks to ReportItem interface
code = code.replace(
    'completedRecsCount: number;',
    'completedRecsCount: number;\n    tasksCount?: number;\n    completedTasksCount?: number;'
);

// Add to re-scan
code = code.replace(
    'completedRecsCount: Math.round(freshItems.length / 3)',
    'completedRecsCount: Math.round(freshItems.length / 3),\n          tasksCount: Math.round(freshItems.length / 3),\n          completedTasksCount: Math.round(freshItems.length / 3)'
);

// Add to rendering UI in details view
const uiStatsFind = `<div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">التوصيات المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedRecsCount || 0}</span>
                            </div>`;
const uiStatsReplace = `<div className="flex justify-between items-center border-t border-indigo-100/50 pt-1 mt-1">
                              <span className="text-gray-600 font-bold">إجمالي المهام:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.tasksCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-indigo-100/50 pt-1 mt-1">
                              <span className="text-gray-600 font-bold">المهام المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedTasksCount || 0}</span>
                            </div>`;

// Check if uiStatsFind exists
if (code.includes('التوصيات المنجزة')) {
   code = code.replace(uiStatsFind, uiStatsFind + '\n                            ' + uiStatsReplace);
}

fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched UI stats");
