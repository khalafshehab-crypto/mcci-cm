const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf8');

const targetStr = `          {activeTab === "reports" ? (
            <button 
              type="button"
              onClick={() => {
                setWizardStep(1);
                setIsReportWizardOpen(true);
              }}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>توليد تقرير دوري ذكي</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleAutoScanAndPopulateKPIs}
                disabled={isSyncingKpis}
                className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                title="مسح مدخلات النظام وتسكينها تلقائياً في ملف Google Sheets"
              >
                <Database className="w-4 h-4" />
                <span>{isSyncingKpis ? "جاري المسح والتصنيف..." : "مسح وتسكين المؤشرات بالسحابة"}</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  setEditingKpi(null);
                  setIsKpiModalOpen(true);
                }}
                className="h-10 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة طلب مؤشر ومعيار</span>
              </button>
            </div>
          )}`;

const newStr = `          {activeTab === "reports" ? (
            <button 
              type="button"
              onClick={() => {
                setWizardStep(1);
                setIsReportWizardOpen(true);
              }}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>توليد تقرير دوري ذكي</span>
            </button>
          ) : activeTab === "kpis" ? (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleAutoScanAndPopulateKPIs}
                disabled={isSyncingKpis}
                className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                title="تصدير ومزامنة مصفوفة تقييم أداء الغرفة 2026 إلى Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isSyncingKpis ? "جاري المزامنة..." : "تصدير ومزامنة مصفوفة تقييم أداء الغرفة 2026"}</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  setEditingKpi(null);
                  setIsKpiModalOpen(true);
                }}
                className="h-10 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة طلب مؤشر ومعيار</span>
              </button>
            </div>
          ) : null}`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
