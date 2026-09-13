const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Find where current_user is parsed or add it at the top of handleSubmit / handleConfirmSeries
  // Wait, let's just replace `employees: [something].filter(Boolean)` 
  // with `employees: Array.from(new Set([JSON.parse(localStorage.getItem("current_user") || "{}")?.name, something].flat().filter(Boolean)))`
  
  content = content.replace(/employees:\s*\[([^\]]+)\]\.filter\(Boolean\)/g, 
    'employees: Array.from(new Set([JSON.parse(localStorage.getItem("current_user") || "{}")?.name, $1].flat().filter(Boolean)))');

  fs.writeFileSync(file, content);
  console.log("Updated employees in", file);
});
