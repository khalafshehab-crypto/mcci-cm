const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

// I need to replace from the broken button end up to the final list filter block.
// Wait, I will just do a string replacement.
const startStr = `                    <button
                      onClick={() => setSelectedCommIdForCards(comm.id)}
                      className="w-full py-3 bg-brand text-white hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-xs rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                   ) : /* Level 3: Classifications inside selected Event Kind & Committee */
          selectedClassificationForCards === null ? (`;

const endStr = `              {(() => {
                const finalList = filteredEvents.filter(
                  (e) =>
                    e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    getEventClassification(e.title) === selectedClassificationForCards
                );3xl p-6 flex flex-col justify-between space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-55/70 text-emerald-800 border border-emerald-100 flex items-center justify-center font-black animate-pulse">
                              <Sliders className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800">{cls}</h4>
                              <p className="text-[10px] text-gray-400 font-bold">نمط الإضافة في الجداول المبرمجة</p>
                            </div>
                          </div>

                          <span className="inline-block self-start px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">
                            {count} فعاليات مسجلة
                          </span>`;

// The broken code in the file currently:
// Let me just grab the entire block from line 1305 to 1481 and replace it cleanly.
