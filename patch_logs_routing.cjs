const fs = require('fs');

// Patch App.tsx
const appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');
if (!appCode.includes('SystemLogs')) {
  appCode = appCode.replace(
    'const OrgChart = React.lazy(() => import("./pages/OrgChart"));',
    'const OrgChart = React.lazy(() => import("./pages/OrgChart"));\nconst SystemLogs = React.lazy(() => import("./pages/SystemLogs"));'
  );
  
  appCode = appCode.replace(
    '<Route path="/org-chart" element={<OrgChart />} />',
    '<Route path="/org-chart" element={<OrgChart />} />\n              <Route path="/system-logs" element={<SystemLogs />} />'
  );
  fs.writeFileSync(appPath, appCode);
  console.log("App.tsx patched for SystemLogs");
}

// Patch Layout.tsx
const layoutPath = 'src/components/Layout.tsx';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');
if (!layoutCode.includes('path: "/system-logs"')) {
  // Add ShieldCheck if not imported
  if (!layoutCode.includes('ShieldCheck,')) {
    layoutCode = layoutCode.replace('import { \n  BarChart2,', 'import { \n  BarChart2,\n  ShieldCheck,');
  }
  
  layoutCode = layoutCode.replace(
    '{ name: "Org Chart", nameAr: "الهيكل الإداري", path: "/org-chart", icon: <Users className="w-4 h-4" /> },',
    '{ name: "Org Chart", nameAr: "الهيكل الإداري", path: "/org-chart", icon: <Users className="w-4 h-4" /> },\n        { name: "System Logs", nameAr: "سجل الحركات", path: "/system-logs", icon: <ShieldCheck className="w-4 h-4" /> },'
  );
  fs.writeFileSync(layoutPath, layoutCode);
  console.log("Layout.tsx patched for SystemLogs");
}
