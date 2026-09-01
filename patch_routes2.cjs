const fs = require('fs');

const appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');

if (!appCode.includes('CommitteesAnalytics')) {
  appCode = appCode.replace(
    'const CommitteesLibrary = React.lazy(() => import("./pages/CommitteesLibrary"));',
    'const CommitteesLibrary = React.lazy(() => import("./pages/CommitteesLibrary"));\nconst CommitteesAnalytics = React.lazy(() => import("./pages/CommitteesAnalytics"));'
  );
  
  appCode = appCode.replace(
    '<Route path="/library" element={<CommitteesLibrary />} />',
    '<Route path="/library" element={<CommitteesLibrary />} />\n              <Route path="/analytics" element={<CommitteesAnalytics />} />'
  );
  
  fs.writeFileSync(appPath, appCode);
  console.log("App.tsx patched again");
}

