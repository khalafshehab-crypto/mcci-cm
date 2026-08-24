const fs = require('fs');

let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

// Remove the tab button
content = content.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\("account_settings"\)\}[\s\S]*?<span>إعدادات الحساب<\/span>\s*<\/button>/g,
  ''
);

// Remove the tab content block
content = content.replace(
  /\{\/\*\s*TAB: ACCOUNT SETTINGS\s*\*\/\}\s*\{activeTab === "account_settings" && \([\s\S]*?<\/\div>\s*\)\}/g,
  ''
);

fs.writeFileSync('src/pages/OrgChart.tsx', content);
