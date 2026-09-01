const fs = require('fs');
const path = 'src/pages/CommitteesReports.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = '{/* -------------------- نافذة تعديل التقرير الدوري مع زر إعادة قراءة بيانات النظام -------------------- */}';
const targetIdx = code.indexOf(targetStr);

if (targetIdx !== -1) {
  // We need to verify what is immediately preceding it. Maybe the Report Wizard Modal?
  const insertStr = `
      {/* -------------------- TAB 3: تحليل أداء اللجان -------------------- */}
      {activeTab === "analytics" && (
        <div className="mt-4">
          <CommitteesAnalytics />
        </div>
      )}

      `;
  
  code = code.slice(0, targetIdx) + insertStr + code.slice(targetIdx);
  fs.writeFileSync(path, code);
  console.log("Inserted analytics block");
} else {
  console.log("Could not find modal marker");
}
