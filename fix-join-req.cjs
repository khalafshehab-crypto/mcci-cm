const fs = require('fs');
let c = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const replacement = `  const verifyJoinRequestsIntegrity = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'join_requests'));
      const data = snapshot.docs.map(d => d.data());
      const pending = data.filter((x: any) => !x.status || x.status === "pending");
      alert(\`اكتمل الفحص: يوجد \${pending.length} طلب انضمام معلق في الخادم الداخلي للمنصة.\`);
    } catch (err: any) {
      alert("فشل الاستعلام من الخادم الداخلي: " + err.message);
    }
  };`;

c = c.replace(/const verifyJoinRequestsIntegrity = async \(\) => \{[\s\S]*?catch \(err: any\) \{[\s\S]*?\}[\s\S]*?\};/m, replacement);
fs.writeFileSync('src/pages/OrgChart.tsx', c);
