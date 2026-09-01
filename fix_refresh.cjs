const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesAnalytics.tsx', 'utf8');

const refreshRegex = /  const handleRefreshData = async \(\) => \{[\s\S]*?\};\n/s;
const newRefresh = `  const handleRefreshData = async () => {
    setIsRefreshing(true);
    showGlobalToast("جاري تحديث واستيراد أحدث البيانات من النظام...", "loading");
    await fetchAllData();
    setIsRefreshing(false);
    showGlobalToast("تمت المزامنة وتحديث لوحة القيادة بنجاح", "success");
  };\n`;

code = code.replace(refreshRegex, newRefresh);
fs.writeFileSync('src/pages/CommitteesAnalytics.tsx', code);
