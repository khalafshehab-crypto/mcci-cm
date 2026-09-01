const fs = require('fs');
const path = 'src/pages/CommitteesAnalytics.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('isRefreshing')) {
  // Add state & toast import
  if(!code.includes('showGlobalToast')) {
      code = code.replace(
        "import { useFirestoreCollection } from '../lib/firebaseUtils';",
        "import { useFirestoreCollection } from '../lib/firebaseUtils';\nimport { showGlobalToast } from '../lib/toastUtils';"
      );
  }
  
  // Add icon
  if(!code.includes('RefreshCw')) {
      code = code.replace(
        'BarChart2, TrendingUp, Users, AlertTriangle, Zap, CheckCircle2',
        'BarChart2, TrendingUp, Users, AlertTriangle, Zap, CheckCircle2, RefreshCw'
      );
  }

  code = code.replace(
    'const { data: dbMembers } = useFirestoreCollection<any>("members", []);',
    'const { data: dbMembers } = useFirestoreCollection<any>("members", []);\n  const [isRefreshing, setIsRefreshing] = React.useState(false);'
  );
  
  // Add function
  const functionCode = `
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    showGlobalToast("جاري تحديث واستيراد أحدث البيانات من النظام...", "loading");
    setTimeout(() => {
      setIsRefreshing(false);
      showGlobalToast("تم تحديث البيانات وجلب أحدث الإحصائيات بنجاح", "success");
    }, 1500);
  };
`;
  
  code = code.replace(
    'const chartData = useMemo(() => {',
    functionCode + '\n  const chartData = useMemo(() => {'
  );
  
  // Add button in the UI
  const buttonHtml = `
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand text-white rounded-xl shadow-lg shadow-brand/30">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">تحليل أداء اللجان</h2>
            </div>
            <p className="text-sm font-bold text-gray-500">نظرة تحليلية مرئية توضح حجم الإنجاز والتحديات وتصنيف الأعضاء</p>
          </div>
          
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className={\`shrink-0 self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm border shadow-sm \${
              isRefreshing 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-brand'
            }\`}
            title="تحديث البيانات"
          >
            <RefreshCw className={\`w-4 h-4 \${isRefreshing ? 'animate-spin' : ''}\`} />
            تحديث البيانات
          </button>
        </div>
`;
  
  code = code.replace(
    /<div className="relative z-10">[\s\S]*?<\/p>\n\s*<\/div>/,
    buttonHtml
  );
  
  fs.writeFileSync(path, code);
  console.log("Patched CommitteesAnalytics.tsx");
}
