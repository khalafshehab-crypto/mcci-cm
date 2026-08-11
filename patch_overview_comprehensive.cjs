const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const target = `              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h5 className="text-xs font-black text-gray-500 border-b border-gray-100 pb-2">قيادات اللجنة</h5>`;

const replacement = `              {(detailsComm.strategicPlan || detailsComm.ratingIssues) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailsComm.strategicPlan && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-emerald-700">
                        <List className="w-4 h-4" />
                        <span className="text-[11px] font-black">الخطة الاستراتيجية المعتمدة</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed whitespace-pre-line">{detailsComm.strategicPlan}</p>
                    </div>
                  )}
                  {detailsComm.ratingIssues && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-amber-700">
                        <TriangleAlert className="w-4 h-4" />
                        <span className="text-[11px] font-black">قضايا التقدير والمخاطر</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed whitespace-pre-line">{detailsComm.ratingIssues}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h5 className="text-xs font-black text-gray-500 border-b border-gray-100 pb-2">قيادات اللجنة</h5>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched overview for comprehensive details");
