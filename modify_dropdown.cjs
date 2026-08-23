const fs = require('fs');

function modifyFile(filePath, modifications) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const mod of modifications) {
    if (typeof mod.search === 'string') {
        content = content.replace(mod.search, mod.replace);
    } else {
        content = content.replace(mod.search, mod.replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Modified ${filePath}`);
}

const replacement = `<div className="md:col-span-3 flex flex-col justify-end min-h-[34px]">
                                                        <select
                                                          value={item.impactType || ""}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { impactType: e.target.value as any })}
                                                          className={\`w-full text-[10px] font-bold p-1 border border-gray-200 rounded bg-white text-right focus:outline-none focus:border-brand \${!item.impactType ? 'text-gray-400' : 'text-slate-800'}\`}
                                                        >
                                                          <option value="" disabled className="text-gray-400">اختر نوع التوصية</option>
                                                          <option value="عادية" className="text-slate-800">توصية عادية</option>
                                                          <option value="آجل" className="text-slate-800">توصية آجلة</option>
                                                          <option value="ذات أثر" className="text-slate-800">توصية ذات أثر</option>
                                                        </select>
                                                        {item.impactType === "ذات أثر" && (
                                                          <div className="flex items-center gap-3 mt-1.5 px-1">
                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                              <input
                                                                type="checkbox"
                                                                checked={!!item.isUrgent}
                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isUrgent: e.target.checked })}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                                              />
                                                              <span className="text-[9px] text-slate-900 font-extrabold">عاجل</span>
                                                            </label>
                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                              <input
                                                                type="checkbox"
                                                                checked={!!item.isImportant}
                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isImportant: e.target.checked })}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                                              />
                                                              <span className="text-[9px] text-slate-900 font-extrabold">مهم</span>
                                                            </label>
                                                          </div>
                                                        )}
                                                      </div>`;

const searchStr = `<div className="md:col-span-3 flex flex-col justify-end min-h-[34px]">
                                                        <select
                                                          value={item.impactType || "عادية"}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { impactType: e.target.value as any })}
                                                          className="w-full text-[10px] font-bold p-1 border border-gray-200 rounded bg-white text-right focus:outline-none focus:border-brand"
                                                        >
                                                          <option value="عادية">توصية عادية</option>
                                                          <option value="آجل">توصية آجل</option>
                                                          <option value="ذات أثر">توصية ذات أثر</option>
                                                        </select>
                                                        {item.impactType === "ذات أثر" && (
                                                          <div className="flex items-center gap-3 mt-1.5 px-1">
                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                              <input
                                                                type="checkbox"
                                                                checked={!!item.isUrgent}
                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isUrgent: e.target.checked })}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                                              />
                                                              <span className="text-[9px] text-slate-900 font-extrabold">عاجل</span>
                                                            </label>
                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                              <input
                                                                type="checkbox"
                                                                checked={!!item.isImportant}
                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isImportant: e.target.checked })}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                                              />
                                                              <span className="text-[9px] text-slate-900 font-extrabold">مهم</span>
                                                            </label>
                                                          </div>
                                                        )}
                                                      </div>`;

modifyFile('src/pages/Events.tsx', [{ search: searchStr, replace: replacement }]);
modifyFile('src/pages/CommitteesEvents.tsx', [{ search: searchStr, replace: replacement }]);

