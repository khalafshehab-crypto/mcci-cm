const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');
code = code.replace(
  /\/\/ Check if already requested[\s\S]*?const requestExists = allReqs\.find\(\(req: any\) => req\.email\?\.trim\(\)\.toLowerCase\(\) === emailLower\);/,
  `// Check if already requested
      const q = query(collection(db, "join_requests"), where("email", "==", emailLower));
      const snap = await getDocs(q);
      const requestExists = !snap.empty;`
);

code = code.replace(
  /await fetch\('\/api\/join-requests', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(payload\)\s*\}\);/,
  `await addDoc(collection(db, "join_requests"), payload);`
);

fs.writeFileSync('src/components/AuthGate.tsx', code);
