const fs = require('fs');
let c = fs.readFileSync('src/hooks/useDashboardStats.ts', 'utf8');

c = c.replace(/const fetchStats = async \(\) => \{/, `const fetchStats = async () => {
    const { auth } = await import("../lib/firebase");
    if (!auth || !auth.currentUser) {
      setLoading(false);
      return;
    }`);

fs.writeFileSync('src/hooks/useDashboardStats.ts', c);
