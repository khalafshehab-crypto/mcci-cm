const fs = require('fs');
let c = fs.readFileSync('src/hooks/useDashboardStats.ts', 'utf8');

c = c.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, `  useEffect(() => {
    // Only fetch stats if we have a real db and we have an authenticated user (to avoid permission denied on initial load before auth completes)
    // Actually we can check auth.currentUser
    import("../lib/firebase").then(({ auth }) => {
       if (auth && auth.currentUser) {
          fetchStats();
       } else {
          // If not logged in yet, try again shortly or wait for the component to be rendered only when authenticated
          setTimeout(fetchStats, 1000);
       }
    }).catch(() => {
       fetchStats();
    });

    const interval = setInterval(fetchStats, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);`);

fs.writeFileSync('src/hooks/useDashboardStats.ts', c);
