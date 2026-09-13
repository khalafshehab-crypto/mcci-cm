const fs = require('fs');
let code = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

const targetSeriesEnd = `                              </div>
                            )}
                          </div>
                        </div>
                      )}`;

const replacementSeriesEnd = `                              </div>
                            )}
                          </div>

                          {/* Row Invitees */}
                          <div className="space-y-2 md:col-span-full border-t border-gray-100 pt-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer w-fit">
                              <input
                                type="checkbox"
                                checked={seriesInviteesEnabled}
                                onChange={(e) => setSeriesInviteesEnabled(e.target.checked)}
                                className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"
                              />
                              <span className="text-xs font-black text-gray-700">دعوة موظفين آخرين للاجتماع</span>
                            </label>
                            {seriesInviteesEnabled && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                {dynamicEmployees.filter(emp => emp !== seriesAssignedEmployee).map(emp => (
                                  <label key={emp} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={seriesInvitedEmployees.includes(emp)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSeriesInvitedEmployees([...seriesInvitedEmployees, emp]);
                                        else setSeriesInvitedEmployees(seriesInvitedEmployees.filter(e => e !== emp));
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
                      )}`;

if (code.indexOf(targetSeriesEnd) !== -1) {
  code = code.replace(targetSeriesEnd, replacementSeriesEnd);
} else {
  console.log("Not found targetSeriesEnd!");
}

fs.writeFileSync('src/pages/CentersEvents.tsx', code);
