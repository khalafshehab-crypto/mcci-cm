const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `                    <div className="border-t border-gray-200/80 pt-3">
                      <span className="text-[10px] text-[#b59410] font-black block mb-1">نص التوصية المعتمدة:</span>
                      <p className="text-xs font-bold text-gray-950 bg-[#fffdf5] p-3 rounded-xl border border-[#e8d284] leading-relaxed">
                        {resolvedDetails.recommendationText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Operational Update Form (مستجدات التوصية والإفادة) */}`;
                    
const newText = `                    <div className="border-t border-gray-200/80 pt-3">
                      <span className="text-[10px] text-[#b59410] font-black block mb-1">نص التوصية المعتمدة:</span>
                      <p className="text-xs font-bold text-gray-950 bg-[#fffdf5] p-3 rounded-xl border border-[#e8d284] leading-relaxed">
                        {resolvedDetails.recommendationText}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 3. Audit Logs (سجل مسار التوصية) */}
                {resolvedDetails.auditLogs && resolvedDetails.auditLogs.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 tracking-wider">سجل مسار التوصية</h4>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 max-h-48 overflow-y-auto">
                      {resolvedDetails.auditLogs.map((log: any, index: number) => (
                        <div key={index} className="flex gap-3 text-right border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                          <div className="mt-1 w-2 h-2 rounded-full bg-brand shrink-0"></div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{log.action}</p>
                            <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{log.timestamp} | {log.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Operational Update Form (مستجدات التوصية والإفادة) */}`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 3");
