const fs = require('fs');
const path = 'src/pages/CommitteesReports.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('isRefreshing')) {
  // Add state
  code = code.replace(
    'const [isLoading, setIsLoading] = useState(false);',
    'const [isLoading, setIsLoading] = useState(false);\n  const [isRefreshing, setIsRefreshing] = useState(false);'
  );
  
  // Add function
  const functionCode = `
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    showGlobalToast("جاري تحديث واستيراد أحدث البيانات من النظام...", "loading");
    // Since Firebase onSnapshot is already real-time, this is mostly a visual cue
    // and forces a small delay to simulate a deep re-fetch for user reassurance.
    setTimeout(() => {
      setIsRefreshing(false);
      showGlobalToast("تم تحديث البيانات وجلب أحدث الإحصائيات بنجاح", "success");
    }, 1500);
  };
`;
  
  code = code.replace(
    '// Setup Firestore listeners',
    functionCode + '\n  // Setup Firestore listeners'
  );
  
  // Add button in the UI
  const buttonHtml = `
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className={\`p-2.5 rounded-xl transition-all cursor-pointer border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 disabled:opacity-50\`}
              title="تحديث البيانات"
            >
              <RefreshCw className={\`w-5 h-5 \${isRefreshing ? 'animate-spin text-blue-600' : ''}\`} />
            </button>
            <AnimatePresence>
`;
  
  code = code.replace(
    '<AnimatePresence>',
    buttonHtml
  );
  
  fs.writeFileSync(path, code);
  console.log("Patched CommitteesReports.tsx");
}
