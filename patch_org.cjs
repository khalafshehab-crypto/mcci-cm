const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(
  /const \[serverJoinRequests, setServerJoinRequests\] = useState<JoinRequest\[\]>\(\[\]\);\s*useEffect\(\(\) => \{\s*fetch\('\/api\/join-requests'\)\s*\.then\(r => r\.json\(\)\)\s*\.then\(data => setServerJoinRequests\(data\)\)\s*\.catch\(e => console\.error\(e\)\);\s*\}, \[\]\);/,
  `const { data: serverJoinRequests, deleteDocument: deleteJoinRequest } = useFirestoreCollection<JoinRequest>("join_requests", []);`
);

code = code.replace(/await fetch\(\`\/api\/join-requests\/\$\{req.id\}\`, \{ method: 'DELETE' \}\);\s*setServerJoinRequests\(prev => prev.filter\(x => x.id !== req.id\)\);/g, `await deleteJoinRequest(req.id);`);
code = code.replace(/await fetch\(\`\/api\/join-requests\/\$\{req.id\}\`, \{ method: 'DELETE' \}\);/g, `await deleteJoinRequest(req.id);`);


fs.writeFileSync('src/pages/OrgChart.tsx', code);
