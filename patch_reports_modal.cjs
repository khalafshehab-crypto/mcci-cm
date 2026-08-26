const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

const replacement = `{selectedDetailsItem.item.notes && (
                  <div>
                    <span className="block font-bold text-gray-400">الملاحظات (وصف التقرير):</span>
                    <p className="font-medium text-gray-600 mt-0.5">{selectedDetailsItem.item.notes}</p>
                  </div>
                )}

                {selectedDetailsItem.type === 'report' && (
                   <div className="space-y-3 mt-4 border-t pt-4 border-gray-100">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">نطاق اللجان المستهدفة</span>
                           <div className="flex flex-wrap gap-1 mt-1 max-h-12 overflow-y-auto custom-scrollbar pr-1">
                              {selectedDetailsItem.item.committees?.map((c, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold border border-blue-100">{c}</span>
                              )) || <span className="text-gray-500 font-bold">غير محدد</span>}
                           </div>
                        </div>
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">نوع التقرير</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.generationType || 'عام'}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-2 rounded-lg">
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">تاريخ بداية الاستخراج</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.startDate || 'غير متوفر'}</p>
                        </div>
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">تاريخ نهاية الاستخراج</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.endDate || 'غير متوفر'}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">منشئ التقرير (الأخصائي)</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.generatedBy || 'النظام'}</p>
                        </div>
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">تاريخ الإصدار / الاعتماد</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.date || 'غير متوفر'}</p>
                        </div>
                     </div>
                     
                     {selectedDetailsItem.item.extractedStats && (
                       <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2">
                         <span className="block font-extrabold text-indigo-900 mb-2 border-b border-indigo-200/50 pb-1.5 text-[11px]">إحصائيات الاستخراج الآلي للأعمال ({selectedDetailsItem.item.selectedItemsCount || 0} شواهد معتمدة)</span>
                         <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] mt-2">
                            <div className="flex justify-between items-center border-b border-indigo-100/50 pb-1">
                              <span className="text-gray-600 font-bold">الاجتماعات:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.meetingsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-indigo-100/50 pb-1">
                              <span className="text-gray-600 font-bold">الفعاليات الأخرى:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.eventsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">إجمالي التوصيات:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.recommendationsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">التوصيات المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedRecsCount || 0}</span>
                            </div>
                         </div>
                       </div>
                     )}
                   </div>
                )}`;

const pattern = /{selectedDetailsItem\.item\.notes && \(\s*<div>\s*<span className="block font-bold text-gray-400">الملاحظات:<\/span>\s*<p className="font-medium text-gray-600 mt-0\.5">{selectedDetailsItem\.item\.notes}<\/p>\s*<\/div>\s*\)}/;

if (pattern.test(code)) {
    code = code.replace(pattern, replacement);
    fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
    console.log("Patched correctly");
} else {
    console.log("Could not find the pattern to replace");
}

