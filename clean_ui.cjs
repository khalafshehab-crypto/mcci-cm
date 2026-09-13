const fs = require('fs');
let code = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

// The single UI looks like it has it twice:
const singlePattern = `<div className="space-y-1 md:col-span-1">
                            <label className="text-[11px] font-black text-gray-500 block">اسم الجهة (اختياري)</label>
                            <input
                              type="text"
                              placeholder="مثال: الهيئة الملكية"
                              value={singlePartyName}
                              onChange={(e) => setSinglePartyName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>`;

const seriesPattern1 = `<div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">اسم الجهة (اختياري)</label>
                            <input
                              type="text"
                              placeholder="مثال: الهيئة الملكية"
                              value={seriesPartyName}
                              onChange={(e) => setSeriesPartyName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>`;

const seriesPattern2 = `<div className="space-y-1 md:col-span-2">
                            <label className="text-[11px] font-black text-gray-500 block">اسم الجهة (اختياري)</label>
                            <input
                              type="text"
                              placeholder="مثال: الهيئة الملكية"
                              value={seriesPartyName}
                              onChange={(e) => setSeriesPartyName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>`;

// Replace multiple occurrences with a single one (or just remove the duplicates)
while (code.split(singlePattern).length > 2) {
    code = code.replace(singlePattern, "");
}
// For series, remove the non-col-span-2 one if both exist
if (code.includes(seriesPattern1) && code.includes(seriesPattern2)) {
    code = code.replace(seriesPattern1, "");
}

fs.writeFileSync('src/pages/CentersEvents.tsx', code);
