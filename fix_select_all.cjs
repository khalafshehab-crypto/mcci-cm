const fs = require('fs');
const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

const blockToRemove = `<div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                      if (seriesAdditionalInvitees.length === allEmployeesNames.length) {
                                        setSeriesAdditionalInvitees([]);
                                      } else {
                                        setSeriesAdditionalInvitees(allEmployeesNames);
                                      }
                                    }}>
                                      <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                      <input type="checkbox" checked={seriesAdditionalInvitees.length === allEmployeesNames.length && allEmployeesNames.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                    </div>`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace whitespace variations and remove the block
  // First, let's just find the index of "if (seriesAdditionalInvitees.length" to locate the block
  
  // We can do it robustly with regex
  const duplicateRegex = /<div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick=\{\(\) => \{\s*if \(seriesAdditionalInvitees\.length === allEmployeesNames\.length\) \{\s*setSeriesAdditionalInvitees\(\[\]\);\s*\} else \{\s*setSeriesAdditionalInvitees\(allEmployeesNames\);\s*\}\s*\}\}>\s*<span className="text-\[11px\] font-bold text-gray-700">تحديد الكل<\/span>\s*<input type="checkbox" checked=\{seriesAdditionalInvitees\.length === allEmployeesNames\.length && allEmployeesNames\.length > 0\} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" \/>\s*<\/div>/g;

  content = content.replace(duplicateRegex, "");

  // Now find the correct insertion point for Series
  const insertTarget = /\{isSeriesInviteesOpen && \(\s*<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">\s*\{Object\.entries\(allGroupedEmployees\)\.map/g;

  content = content.replace(insertTarget, (match) => {
    return match.replace('{Object.entries(allGroupedEmployees).map', `
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                      if (seriesAdditionalInvitees.length === allEmployeesNames.length) {
                                        setSeriesAdditionalInvitees([]);
                                      } else {
                                        setSeriesAdditionalInvitees(allEmployeesNames);
                                      }
                                    }}>
                                      <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                      <input type="checkbox" checked={seriesAdditionalInvitees.length === allEmployeesNames.length && allEmployeesNames.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                    </div>
                                    {Object.entries(allGroupedEmployees).map`);
  });

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
