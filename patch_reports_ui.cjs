const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

const uiReplacement = `{selectedDetailsItem.item.extractedStats && (
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
                            <div className="flex justify-between items-center border-b border-indigo-100/50 pb-1 col-span-2">
                              <span className="text-gray-600 font-bold">التوصيات المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedRecsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">إجمالي المهام:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.tasksCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">المهام المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedTasksCount || 0}</span>
                            </div>
                         </div>
                       </div>
                     )}

                     {selectedDetailsItem.item.extractedItems && selectedDetailsItem.item.extractedItems.length > 0 && (
                       <div className="mt-4 border-t pt-4 border-gray-100 max-h-48 overflow-y-auto custom-scrollbar">
                         <span className="block font-extrabold text-gray-800 mb-3 text-xs">تفاصيل الشواهد والأعمال المرفقة:</span>
                         <div className="space-y-2 pr-1">
                           {selectedDetailsItem.item.extractedItems.map((extractedItem: any, idx: number) => (
                             <div key={idx} className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm flex flex-col gap-1">
                               <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className={\`px-1.5 py-0.5 rounded text-[8px] font-black \${
                                      extractedItem.category === 'event' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                      extractedItem.category === 'recommendation' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                      'bg-amber-50 text-amber-700 border border-amber-100'
                                    }\`}>
                                      {extractedItem.type || 'عنصر'}
                                    </span>
                                    <span className="font-bold text-gray-800 text-[10px] truncate max-w-[150px]">{extractedItem.title}</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{extractedItem.date}</span>
                               </div>
                               <div className="flex justify-between items-center mt-0.5">
                                  <span className="text-[9px] text-gray-600 truncate max-w-[150px]"><span className="font-bold">اللجنة:</span> {extractedItem.committee}</span>
                                  <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded-md \${
                                    ['منجزة', 'مكتملة', 'محجوز', 'مؤكد'].includes(extractedItem.status) ? 'bg-emerald-50 text-emerald-600' : 
                                    ['متأخرة'].includes(extractedItem.status) ? 'bg-red-50 text-red-600' :
                                    'bg-gray-100 text-gray-600'
                                  }\`}>
                                    {extractedItem.status || 'مسجل'}
                                  </span>
                               </div>
                               {extractedItem.details && (
                                 <p className="text-[9px] text-gray-500 mt-0.5 bg-gray-50 p-1 rounded line-clamp-2 leading-relaxed">
                                   {extractedItem.details}
                                 </p>
                               )}
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
`;

const uiRegex = /\{selectedDetailsItem\.item\.extractedStats && \([\s\S]*?\}\s*\)\}\s*<\/div>\s*\)\}/;
code = code.replace(uiRegex, uiReplacement + "\n                   </div>\n                )}");

fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched UI");
