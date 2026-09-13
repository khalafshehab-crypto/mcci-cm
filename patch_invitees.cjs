const fs = require('fs');

const singleBlock = `                          {/* Additional Invitees Single */}
                          <div className="md:col-span-full border-t border-gray-200 mt-2 pt-4 space-y-4">
                            <h4 className="text-xs font-bold text-gray-800">إدارة الدعوات</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Internal Invitees */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات داخلية (إدارية)</label>
                                <div 
                                  onClick={() => setIsSingleInviteesOpen(!isSingleInviteesOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {singleAdditionalInvitees.length === 0 && <span className="text-gray-400">اختر موظفين...</span>}
                                  {singleAdditionalInvitees.map(name => (
                                    <span key={name} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {name}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setSingleAdditionalInvitees(prev => prev.filter(p => p !== name)); }} className="hover:text-blue-900"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSingleInviteesOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (
                                      <div key={group}>
                                        <div className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-600 border-y border-gray-200 sticky top-0 z-10">{group}</div>
                                        {emps.map((emp: any) => (
                                          <label key={emp.name} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                            <input type="checkbox" checked={singleAdditionalInvitees.includes(emp.name)} 
                                              onChange={(e) => {
                                                if (e.target.checked) setSingleAdditionalInvitees(prev => [...prev, emp.name]);
                                                else setSingleAdditionalInvitees(prev => prev.filter(p => p !== emp.name));
                                              }}
                                            className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                            <span className="text-xs font-semibold text-gray-800">{emp.name}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Committee Members */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات أعضاء اللجنة</label>
                                <div 
                                  onClick={() => setIsSingleMembersOpen(!isSingleMembersOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {newMembers.length === 0 && <span className="text-gray-400">اختر أعضاء...</span>}
                                  {newMembers.map(id => (
                                    <span key={id} className="px-2 py-0.5 bg-brand/10 text-brand rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {allMembers.find(m => m.id === id)?.name || id}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleMember(id); }} className="hover:text-brand-dark"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSingleMembersOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    {committeeMembers.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة</div>}
                                    {committeeMembers.map((m: any) => (
                                      <label key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-brand/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                        <input type="checkbox" checked={newMembers.includes(m.id)} 
                                          onChange={() => toggleMember(m.id)}
                                        className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                        <span className="text-xs font-semibold text-gray-800">{m.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* External */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات خارجية (أشخاص / إيميلات)</label>
                                <input 
                                  type="text" 
                                  value={externalInput}
                                  onChange={(e) => setExternalInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && externalInput.trim()) {
                                      e.preventDefault();
                                      if (!singleExternalInvitees.includes(externalInput.trim())) {
                                        setSingleExternalInvitees(prev => [...prev, externalInput.trim()]);
                                      }
                                      setExternalInput("");
                                    }
                                  }}
                                  placeholder="اكتب واضغط Enter..."
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                                />
                                {singleExternalInvitees.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {singleExternalInvitees.map(ext => (
                                      <span key={ext} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold flex items-center gap-1">
                                        {ext} <button type="button" onClick={() => setSingleExternalInvitees(prev => prev.filter(p => p !== ext))} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>`;

const seriesBlock = `                          {/* Additional Invitees Series */}
                          <div className="md:col-span-full border-t border-gray-200 mt-2 pt-4 space-y-4">
                            <h4 className="text-xs font-bold text-gray-800">إدارة الدعوات</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Internal Invitees */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات داخلية (إدارية)</label>
                                <div 
                                  onClick={() => setIsSeriesInviteesOpen(!isSeriesInviteesOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {seriesAdditionalInvitees.length === 0 && <span className="text-gray-400">اختر موظفين...</span>}
                                  {seriesAdditionalInvitees.map(name => (
                                    <span key={name} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {name}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setSeriesAdditionalInvitees(prev => prev.filter(p => p !== name)); }} className="hover:text-blue-900"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSeriesInviteesOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (
                                      <div key={group}>
                                        <div className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-600 border-y border-gray-200 sticky top-0 z-10">{group}</div>
                                        {emps.map((emp: any) => (
                                          <label key={emp.name} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                            <input type="checkbox" checked={seriesAdditionalInvitees.includes(emp.name)} 
                                              onChange={(e) => {
                                                if (e.target.checked) setSeriesAdditionalInvitees(prev => [...prev, emp.name]);
                                                else setSeriesAdditionalInvitees(prev => prev.filter(p => p !== emp.name));
                                              }}
                                            className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                            <span className="text-xs font-semibold text-gray-800">{emp.name}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Committee Members */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات أعضاء اللجنة</label>
                                <div 
                                  onClick={() => setIsSeriesMembersOpen(!isSeriesMembersOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {newMembers.length === 0 && <span className="text-gray-400">اختر أعضاء...</span>}
                                  {newMembers.map(id => (
                                    <span key={id} className="px-2 py-0.5 bg-brand/10 text-brand rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {allMembers.find(m => m.id === id)?.name || id}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleMember(id); }} className="hover:text-brand-dark"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSeriesMembersOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    {committeeMembers.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة</div>}
                                    {committeeMembers.map((m: any) => (
                                      <label key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-brand/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                        <input type="checkbox" checked={newMembers.includes(m.id)} 
                                          onChange={() => toggleMember(m.id)}
                                        className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                        <span className="text-xs font-semibold text-gray-800">{m.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* External */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات خارجية (أشخاص / إيميلات)</label>
                                <input 
                                  type="text" 
                                  value={seriesExternalInput}
                                  onChange={(e) => setSeriesExternalInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && seriesExternalInput.trim()) {
                                      e.preventDefault();
                                      if (!seriesExternalInvitees.includes(seriesExternalInput.trim())) {
                                        setSeriesExternalInvitees(prev => [...prev, seriesExternalInput.trim()]);
                                      }
                                      setSeriesExternalInput("");
                                    }
                                  }}
                                  placeholder="اكتب واضغط Enter..."
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                                />
                                {seriesExternalInvitees.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {seriesExternalInvitees.map(ext => (
                                      <span key={ext} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold flex items-center gap-1">
                                        {ext} <button type="button" onClick={() => setSeriesExternalInvitees(prev => prev.filter(p => p !== ext))} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>`;

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the single block: from {/* Additional Invitees Single */} to just before {/* Row 4 */} or another block that might follow
  const singleRegex = /\{\/\* Additional Invitees Single \*\/\}[\s\S]*?(?=\{\/\* Row 4 \*\/\}|  <div className="space-y-1">\s*<label className="text-\[11px\] font-black text-gray-500 block">يوم الانعقاد \*<\/label>|  <div className="space-y-1">\s*<label className="text-\[11px\] font-black text-gray-500 block">يوم الإنعقاد \*<\/label>)/;
  
  if (content.match(singleRegex)) {
    content = content.replace(singleRegex, singleBlock + '\n\n                          ');
  }

  // Regex to match the series block
  const seriesRegex = /\{\/\* Additional Invitees Series \*\/\}[\s\S]*?(?=\{\/\* Row 4 \*\/\}|  <div className="space-y-1">\s*<label className="text-\[11px\] font-black text-gray-500 block">يوم الانعقاد \*<\/label>|  <div className="space-y-1">\s*<label className="text-\[11px\] font-black text-gray-500 block">يوم الإنعقاد \*<\/label>|  <div className="space-y-1 md:col-span-2">\s*<label className="text-\[11px\] font-black text-gray-500 block">اسم الجهة)/;

  if (content.match(seriesRegex)) {
    content = content.replace(seriesRegex, seriesBlock + '\n                          ');
  }

  fs.writeFileSync(file, content);
  console.log(`Patched UI in ${file}`);
}
