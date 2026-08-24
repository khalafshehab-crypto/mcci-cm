const fs = require('fs');
let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const tabButtonIndex = content.indexOf('<button\n          onClick={() => setActiveTab("account_settings")}');
if (tabButtonIndex !== -1) {
  const endIndex = content.indexOf('</button>', tabButtonIndex) + 9;
  content = content.substring(0, tabButtonIndex) + content.substring(endIndex);
}

const tabContentIndex = content.indexOf('{/* TAB: ACCOUNT SETTINGS */}');
if (tabContentIndex !== -1) {
  const nextTabIndex = content.indexOf('{/* TAB 1: EMPLOYEES */}');
  if (nextTabIndex !== -1) {
    content = content.substring(0, tabContentIndex) + content.substring(nextTabIndex);
  }
}

fs.writeFileSync('src/pages/OrgChart.tsx', content);
