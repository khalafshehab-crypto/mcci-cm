import re
import os

files = [
    'src/pages/AssistantSecGen.tsx',
    'src/pages/Centers.tsx',
    'src/pages/Affiliates.tsx'
]

replacement = """                            <div className="text-[9px] font-black text-gray-400 mb-1">حالة الاجتماع الحالية:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {(() => {
                                let displayStatus = evtObj.meetingStatus || "غير محدد";
                                if (displayStatus === "مؤجل ويطلب موعد بديل") {
                                  displayStatus = `مؤجل إلى تاريخ ${evtObj.postponeDate || ""}`;
                                } else if (displayStatus === "ملغي ويطلب سبب الإلغاء") {
                                  displayStatus = `ملغي بسبب ${evtObj.cancelReason || ""}`;
                                } else if (displayStatus === "منتهية" || displayStatus === "تم عقد الاجتماع") {
                                  displayStatus = "تم عقد الاجتماع";
                                }
                                
                                let statusClass = "bg-gray-50 text-gray-600 border-gray-200";
                                if (displayStatus === "محجوز") statusClass = "bg-blue-50 text-blue-700 border-blue-200 shadow-sm";
                                else if (displayStatus === "مؤكد" || displayStatus === "تم عقد الاجتماع") statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm";
                                else if (displayStatus.startswith("مؤجل")) statusClass = "bg-amber-50 text-amber-700 border-amber-200 shadow-sm";
                                else if (displayStatus.startswith("ملغي")) statusClass = "bg-rose-50 text-rose-700 border-rose-200 shadow-sm";
                                
                                return (
                                  <button
                                    type="button"
                                    onClick={() => navigate("/events", { state: { selectedEventId: evtObj.id } })}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black text-center border transition-all cursor-pointer select-none ${statusClass}`}
                                  >
                                    {displayStatus}
                                  </button>
                                );
                              })()}
                            </div>"""

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Match the old logic
        old_pattern = r'<div className="text-\[9px\] font-black text-gray-400 mb-1">الإجراءات التفاعلية للفعالية \(انقر للانتقال مباشرة\):</div>\s*<div className="grid grid-cols-2 sm:grid-cols-3 gap-1\.5">\s*\{getStepsForEventAlarm\(evtObj\)\.map\(\(step\) => \{[\s\S]*?\}\)\}\s*</div>'
        
        content = re.sub(old_pattern, replacement, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched alarms in {file_path}")

