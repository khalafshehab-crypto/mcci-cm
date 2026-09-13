const fs = require('fs');
let code = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

// Insert singlePartyName
const targetSingleQaa = `<div className="space-y-1 md:col-span-1">
                            <label className="text-[11px] font-black text-gray-500 block">القاعة *</label>`;

const replacementSingleParty = `<div className="space-y-1 md:col-span-1">
                            <label className="text-[11px] font-black text-gray-500 block">اسم الجهة (اختياري)</label>
                            <input
                              type="text"
                              placeholder="مثال: الهيئة الملكية"
                              value={singlePartyName}
                              onChange={(e) => setSinglePartyName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>
                          
                          <div className="space-y-1 md:col-span-1">
                            <label className="text-[11px] font-black text-gray-500 block">القاعة *</label>`;

if (code.indexOf('اسم الجهة (اختياري)') === -1) {
  code = code.replace(targetSingleQaa, replacementSingleParty);
}

const targetSingleRoomEnd = `                              {ROOMS.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                      
                      {newType === "متسلسلة" && (`;

const inviteesSingle = `                              {ROOMS.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                            </select>
                          </div>
                          
                          {/* Row 4: Invitees */}
                          <div className="space-y-2 md:col-span-3 border-t border-gray-100 pt-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer w-fit">
                              <input
                                type="checkbox"
                                checked={singleInviteesEnabled}
                                onChange={(e) => setSingleInviteesEnabled(e.target.checked)}
                                className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"
                              />
                              <span className="text-xs font-black text-gray-700">دعوة موظفين آخرين للاجتماع</span>
                            </label>
                            {singleInviteesEnabled && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                {dynamicEmployees.filter(emp => emp !== singleEmployee).map(emp => (
                                  <label key={emp} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={singleInvitedEmployees.includes(emp)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSingleInvitedEmployees([...singleInvitedEmployees, emp]);
                                        else setSingleInvitedEmployees(singleInvitedEmployees.filter(e => e !== emp));
                                      }}
                                      className="w-3.5 h-3.5 text-brand rounded border-gray-300 focus:ring-brand"
                                    />
                                    <span className="text-[10px] font-bold text-gray-600 line-clamp-1" title={emp}>{emp}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {newType === "متسلسلة" && (`;

if (code.indexOf('دعوة موظفين آخرين للاجتماع') === -1) {
  code = code.replace(targetSingleRoomEnd, inviteesSingle);
}

fs.writeFileSync('src/pages/CentersEvents.tsx', code);
