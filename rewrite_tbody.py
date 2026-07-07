import re

with open('src/pages/CommitteesRecommendations.tsx', 'r') as f:
    content = f.read()

# We need to replace the tbody for the Table View.
# It starts with: <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
# And ends before the </table> that closes the Table Register View Layout.

start_str = '<tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">'
end_str = '            </table>\n          </div>\n        </div>\n      )\n    </div>\n  );\n}\n\nexport default'

start_idx = content.find(start_str)
end_idx = content.find('              </tbody>\n            </table>', start_idx)

if start_idx != -1 and end_idx != -1:
    print(f"Found tbody at {start_idx} to {end_idx}")
    new_tbody = """<tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
                {sortedTableEvents.map((evt: any, idx: number) => {
                  const isExpanded = expandedEventId === evt.id;
                  
                  return (
                    <React.Fragment key={evt.id}>
                      <tr 
                        id={`event-row-${evt.id}`}
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className={`hover:bg-slate-100/80 transition-colors text-right divide-x divide-x-reverse divide-gray-200 text-[11px] font-bold text-gray-700 cursor-pointer ${isExpanded ? "bg-slate-50/90 border-r-2 border-r-brand shadow-inner" : ""}`}
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap text-right text-gray-900 font-mono font-black" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              className="rounded text-brand"
                              checked={selectedEventIds.includes(evt.id)} 
                              onChange={() => toggleSelectEvent(evt.id)}
                            />
                            <span>{idx + 1}</span>
                          </div>
                        </td>
                        
                        {/* رقم التوصية */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center text-gray-900 font-mono font-black">
                          <span className="inline-block px-2 py-1 select-all font-mono font-black text-brand bg-brand/5 border border-brand/10 rounded text-[10.5px]">
                            REC-{String(evt.id || "").substring(0, 5).toUpperCase()}
                          </span>
                        </td>

                        {/* عنوان التوصية */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-black text-gray-900 group/row" title="انقر لتشغيل منصة التحضير">
                          <div className="flex flex-col text-right truncate">
                            <span className="text-[11.5px] font-bold text-gray-900 leading-tight transition-colors group-hover/row:text-brand underline decoration-dotted decoration-brand/45 underline-offset-4 truncate mb-1">
                              {evt.title || "بدون عنوان"}
                            </span>
                            {evt.description ? (
                              <div className="text-[9.5px] text-brand font-bold truncate max-w-sm">
                                {evt.description.substring(0, 65).replace(/[\r\n]+/g, " ")}...
                              </div>
                            ) : (
                              <div className="text-[9px] text-gray-400 font-bold">
                                (لا يوجد وصف تفصيلي)
                              </div>
                            )}
                          </div>
                        </td>

                        {/* اللجنة */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-800 text-[11px]">
                              {evt.committeeName || "غير محدد"}
                            </span>
                            <span className="text-[9.5px] text-gray-500 font-bold mt-0.5 max-w-[12rem] truncate">
                              مستخرجة من: {evt.eventName || "توصية مستقلة"}
                            </span>
                          </div>
                        </td>

                        {/* تاريخ التوصية */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono text-gray-800 font-black">{evt.date || "-"}</span>
                          </div>
                        </td>

                        {/* الحالة */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black border
                            ${evt.status === 'منجزة' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              evt.status === 'متأخرة' ? 'bg-red-50 text-red-700 border-red-200' : 
                              evt.status === 'جاري العمل عليها' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              'bg-blue-50 text-blue-700 border-blue-200'}
                          `}>
                            {evt.status || "جديدة"}
                          </span>
                        </td>

                        {/* الإجراءات */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => {}} // Disabled editing from table view for now
                              className="p-1.5 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded shadow-sm transition-all"
                              title="تعديل (غير متاح في وضع السجل حالياً)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {}} // Disabled deletion from table view for now
                              className="p-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded shadow-sm transition-all"
                              title="حذف (غير متاح في وضع السجل حالياً)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Area placeholder */}
                      {isExpanded && (
                        <tr className="bg-slate-50 border-b border-gray-200 shadow-inner">
                          <td colSpan={7} className="p-0">
                            <div className="p-6">
                              <p className="text-sm font-bold text-gray-700">{evt.description || "لا يوجد تفاصيل إضافية."}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}"""
    new_content = content[:start_idx] + new_tbody + content[end_idx:]
    with open('src/pages/CommitteesRecommendations.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced tbody successfully")
else:
    print("Could not find bounds")

