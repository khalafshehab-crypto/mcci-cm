const fs = require('fs');
const path = 'src/pages/CommitteesReports.tsx';
let code = fs.readFileSync(path, 'utf8');

// I will insert the activeTab === 'analytics' block right before '{/* -------------------- Report Wizard Modal -------------------- */}'
const targetStr = '{/* -------------------- Report Wizard Modal -------------------- */}';
const targetIdx = code.indexOf(targetStr);

if (targetIdx !== -1) {
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
  console.log("Could not find Report Wizard Modal marker");
}
