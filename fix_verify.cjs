const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const regex = /const verifyJoinRequestsIntegrity = async \(\) => \{[\s\S]*?\}\s*catch\s*\(err:\s*any\)\s*\{[\s\S]*?\}\s*\};/;

const newFunc = `const verifyJoinRequestsIntegrity = async () => {
    try {
      const res = await fetch('/api/join-requests');
      const data = await res.json();
      const pending = data.filter((x: any) => !x.status || x.status === "pending");
      alert(\`اكتمل الفحص: يوجد \${pending.length} طلب انضمام معلق في الخادم الداخلي للمنصة.\`);
    } catch (err: any) {
      alert("فشل الاستعلام من الخادم الداخلي.");
    }
  };`;

code = code.replace(regex, newFunc);
fs.writeFileSync('src/pages/OrgChart.tsx', code);
console.log("Updated verifyJoinRequestsIntegrity");
