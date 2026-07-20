const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const targetUI = `{/* Committee selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-500 block">اللجنة*</label>
                  <select
                    value={selectedCommitteeId}
                    onChange={(e) => setSelectedCommitteeId(e.target.value)}
                    className="w-full h-10 px-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value={0}>يرجى اختيار اللجنة</option>
                    {allCommittees.filter(c => canUserEditCommittee(c.name)).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>`;

const replacementUI = `{/* Committee selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">اللجنة الأساسية*</label>
                    <select
                      value={selectedCommitteeId}
                      onChange={(e) => setSelectedCommitteeId(e.target.value)}
                      className="w-full h-10 px-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value={0}>يرجى اختيار اللجنة</option>
                      {allCommittees.filter(c => canUserEditCommittee(c.name)).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">اللجنة الإضافية (اختياري)</label>
                    <select
                      value={secondaryCommitteeId}
                      onChange={(e) => setSecondaryCommitteeId(e.target.value)}
                      className="w-full h-10 px-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value={0}>بدون لجنة إضافية</option>
                      {allCommittees.filter(c => canUserEditCommittee(c.name)).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>`;

code = code.replace(targetUI, replacementUI);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Added secondary committee UI");
