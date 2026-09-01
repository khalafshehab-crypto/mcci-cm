const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf8');

const targetStr = `      {activeTab === "kpis" && (
        <div className="space-y-6">
          
          {/* شريط فلترة المحاور */}`;

const newStr = `      {activeTab === "kpis" && (
        <div className="space-y-6">
          
          {/* شريط تنبيهات الإنذار المبكر */}
          {filteredKpis.some(k => k.achievementRate < 70) && (
            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-red-800 text-sm">إنذار مبكر: مؤشرات متأخرة</h4>
                  <p className="text-xs text-red-600 font-semibold mt-1">يوجد {filteredKpis.filter(k => k.achievementRate < 70).length} مؤشرات تقل نسبة إنجازها عن 70%، تتطلب إعداد خطة تصحيحية عاجلة.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* شريط فلترة المحاور */}`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
