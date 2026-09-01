const fs = require('fs');

const appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');

if (!appCode.includes('const CommitteesAnalytics')) {
  appCode = appCode.replace(
    'const CommitteesLibrary = React.lazy(() => import("./pages/CommitteesLibrary"));',
    'const CommitteesLibrary = React.lazy(() => import("./pages/CommitteesLibrary"));\nconst CommitteesAnalytics = React.lazy(() => import("./pages/CommitteesAnalytics"));'
  );
  
  fs.writeFileSync(appPath, appCode);
  console.log("App.tsx import patched");
}
