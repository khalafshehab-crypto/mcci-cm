const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesAnalytics.tsx', 'utf8');

// Replace imports
code = code.replace(/import \{ useFirestoreCollection \} from '\.\.\/lib\/firebaseUtils';/, `import { getDocs, collection } from "firebase/firestore";\nimport { db } from "../lib/firebase";\nimport { useEffect } from "react";`);

// Replace hook usage with states
const hooksRegex = /  const \{ data: dbCommittees \}.*?const \{ data: dbEmployees \}.*?\[\]\);/s;
const newStates = `  const [dbCommittees, setDbCommittees] = useState<any[]>([]);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbTasks, setDbTasks] = useState<any[]>([]);
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [dbKpis, setDbKpis] = useState<any[]>([]);
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [comms, evts, tasks, mbrs, kpis, emps] = await Promise.all([
        getDocs(collection(db, "committees")),
        getDocs(collection(db, "events")),
        getDocs(collection(db, "tasks")),
        getDocs(collection(db, "members")),
        getDocs(collection(db, "kpis")),
        getDocs(collection(db, "employees")) // fixed collection name from users to employees
      ]);
      setDbCommittees(comms.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbEvents(evts.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbTasks(tasks.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbMembers(mbrs.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbKpis(kpis.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbEmployees(emps.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching analytics data", e);
    }
  };

  useEffect(() => {
    fetchAllData().finally(() => setInitialLoading(false));
  }, []);`;
code = code.replace(hooksRegex, newStates);

// Update handleRefreshData
const refreshRegex = /  const handleRefreshData = async \(\) => \{\n    setIsRefreshing\(true\);\n    showGlobalToast\("جاري تحديث واستيراد أحدث البيانات من النظام...", "loading"\);\n    setTimeout\(\(\) => \{\n      setIsRefreshing\(false\);\n      showGlobalToast\("تمت المزامنة وتحديث لوحة القيادة بنجاح", "success"\);\n    \}, 2000\);\n  \};/;
const newRefresh = `  const handleRefreshData = async () => {
    setIsRefreshing(true);
    showGlobalToast("جاري تحديث واستيراد أحدث البيانات من النظام...", "loading");
    await fetchAllData();
    setIsRefreshing(false);
    showGlobalToast("تمت المزامنة وتحديث لوحة القيادة بنجاح", "success");
  };`;
code = code.replace(refreshRegex, newRefresh);

fs.writeFileSync('src/pages/CommitteesAnalytics.tsx', code);
