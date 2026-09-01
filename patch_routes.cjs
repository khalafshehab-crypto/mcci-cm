const fs = require('fs');

const appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');

// Import CommitteesAnalytics
if (!appCode.includes('CommitteesAnalytics')) {
  appCode = appCode.replace(
    'import CommitteesLibrary from "./pages/CommitteesLibrary";',
    'import CommitteesLibrary from "./pages/CommitteesLibrary";\nimport CommitteesAnalytics from "./pages/CommitteesAnalytics";'
  );
  
  appCode = appCode.replace(
    '<Route path="/library" element={<CommitteesLibrary />} />',
    '<Route path="/library" element={<CommitteesLibrary />} />\n              <Route path="/analytics" element={<CommitteesAnalytics />} />'
  );
  
  fs.writeFileSync(appPath, appCode);
  console.log("App.tsx patched");
}

const layoutPath = 'src/components/Layout.tsx';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

// Add to Committees pages
if (!layoutCode.includes('path: "/analytics"')) {
  layoutCode = layoutCode.replace(
    '{ name: "Reports", nameAr: "التقارير", path: "/reports", icon: <FileText className="w-4 h-4" /> },',
    '{ name: "Reports", nameAr: "التقارير", path: "/reports", icon: <FileText className="w-4 h-4" /> },\n        { name: "Analytics", nameAr: "تحليل الأداء", path: "/analytics", icon: <BarChart2 className="w-4 h-4" /> },'
  );
  
  // also add BarChart2 to imports if missing
  if (!layoutCode.includes('BarChart2')) {
    layoutCode = layoutCode.replace(
      'import { \n  Settings, ',
      'import { \n  Settings, \n  BarChart2,'
    );
  }
  
  fs.writeFileSync(layoutPath, layoutCode);
  console.log("Layout.tsx patched");
}

