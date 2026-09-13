import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

missing_grid = r'''
          {selectedCommIdForCards === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {committees.map((comm) => {
                const commRecsCount = filteredEvents.filter(e => e.committeeId === comm.id).length;
                return (
                  <button
                    key={comm.id}
                    onClick={() => setSelectedCommIdForCards(comm.id as number)}
                    className="flex flex-col gap-4 bg-white border border-gray-200 p-6 rounded-2xl hover:border-brand hover:shadow-md transition-all text-right group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-brand/5 group-hover:text-brand transition-colors text-slate-400">
                        <Users2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-gray-800 text-sm">{comm.name}</h3>
                        <p className="text-xs text-gray-500 font-bold mt-1">فعاليات التوصيات: {commRecsCount}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCommIdForCards !== null && selectedEventIdForCards === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.filter(e => e.committeeId === selectedCommIdForCards).map((evt) => {
                const recsCount = (evt.agenda || []).filter(item => item.recommendation && item.recommendation.trim() !== "").length;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventIdForCards(evt.id)}
                    className="flex flex-col gap-4 bg-white border border-gray-200 p-6 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Presentation className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-gray-800 text-sm">{evt.title}</h3>
                        <p className="text-xs text-gray-500 font-bold mt-1">التوصيات: {recsCount}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCommIdForCards !== null && selectedEventIdForCards !== null && (
            <div>
              {events.filter(e => e.id === selectedEventIdForCards).map(evt => (
                <div key={evt.id}>
                  {renderPreparationPlatform(evt)}
                </div>
              ))}
            </div>
          )}
'''

missing_table = r'''
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-black">
                  <th className="px-4 py-4 pr-6">#</th>
                  <th className="px-4 py-4 w-1/3">الموضوع / التوصية</th>
                  <th className="px-4 py-4">اللجنة والفعالية</th>
                  <th className="px-4 py-4">المسؤول</th>
                  <th className="px-4 py-4">المدة</th>
                  <th className="px-4 py-4 pl-6 text-left">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableRecommendations.map((rec: any, index: number) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 pr-6">
                      <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-extrabold text-gray-800 text-sm">{rec.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{rec.description}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-gray-700">{rec.committeeName}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{rec.eventName || rec.date}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{rec.assignedTo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-bold text-gray-500">{rec.duration}</span>
                    </td>
                    <td className="px-4 py-4 pl-6 text-left">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        rec.status === 'منتهية' || rec.status === 'مكتملة' ? 'bg-emerald-50 text-emerald-700' :
                        rec.status === 'متأخرة' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
'''

# Find the insertion point:
#                 })()}
#               </span>
#             </div>
#           </div>
#         </div>
#       ) : null}

target = r'''                  return dbRecommendationsCount;
                })()}
              </span>
            </div>
          </div>'''

replacement = target + missing_grid

content = content.replace(target, replacement)

target2 = r'''        </div>
      ) : null}
    </div>'''

replacement2 = r'''        </div>
      ) : null}
''' + missing_table + r'''
      ) : null}
    </div>'''

content = content.replace(target2, replacement2)

with open('src/pages/CommitteesRecommendations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
