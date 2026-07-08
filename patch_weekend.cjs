const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('const isWeekend = (dateStr: string)')) {
    content = content.replace(
      'const CLASSIFICATIONS = ["دوري", "استثنائي", "فريق عمل", "طارئ"];',
      'const CLASSIFICATIONS = ["دوري", "استثنائي", "فريق عمل", "طارئ"];\nconst isWeekend = (dateStr: string) => {\n  if (!dateStr) return false;\n  const d = new Date(dateStr);\n  return d.getDay() === 5 || d.getDay() === 6;\n};'
    );
  }

  const oldSingleDateBlock = `<div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">التاريخ *</label>
                            <input
                              type="date"
                              required
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>`;

  const newSingleDateBlock = `<div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">التاريخ *</label>
                            <input
                              type="date"
                              required
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                            {isWeekend(newDate) && <p className="text-red-500 text-[10px] font-bold mt-1">تنبيه: هذا التاريخ يوافق إجازة نهاية الأسبوع</p>}
                          </div>`;

  content = content.replace(oldSingleDateBlock, newSingleDateBlock);

  const oldSeriesStartDateBlock = `<div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">تاريخ البداية *</label>
                            <input
                              type="date"
                              required
                              value={seriesStartDate}
                              onChange={(e) => setSeriesStartDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>`;
                          
  const newSeriesStartDateBlock = `<div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">تاريخ البداية *</label>
                            <input
                              type="date"
                              required
                              value={seriesStartDate}
                              onChange={(e) => setSeriesStartDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                            {isWeekend(seriesStartDate) && <p className="text-red-500 text-[10px] font-bold mt-1">تنبيه: هذا التاريخ يوافق إجازة نهاية الأسبوع</p>}
                          </div>`;

  content = content.replace(oldSeriesStartDateBlock, newSeriesStartDateBlock);

  const oldSeriesEndDateBlock = `<div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">تاريخ النهاية *</label>
                            <input
                              type="date"
                              required
                              value={seriesEndDate}
                              onChange={(e) => setSeriesEndDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>`;
                          
  const newSeriesEndDateBlock = `<div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">تاريخ النهاية *</label>
                            <input
                              type="date"
                              required
                              value={seriesEndDate}
                              onChange={(e) => setSeriesEndDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                            {isWeekend(seriesEndDate) && <p className="text-red-500 text-[10px] font-bold mt-1">تنبيه: هذا التاريخ يوافق إجازة نهاية الأسبوع</p>}
                          </div>`;

  content = content.replace(oldSeriesEndDateBlock, newSeriesEndDateBlock);

  fs.writeFileSync(file, content);
  console.log("Patched " + file);
}
