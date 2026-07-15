const fs = require('fs');
let content = fs.readFileSync('src/components/AuthGate.tsx', 'utf-8');

const importTarget = `import { auth } from "../lib/firebase";`;
const importReplace = `import { auth, db } from "../lib/firebase";\nimport { collection, getDocs, query, where } from "firebase/firestore";`;

content = content.replace(importTarget, importReplace);

const loginTarget = `    // 2. Is this a registered employee?
    const matchedEmployee = dbEmployees.find(
      (emp: any) => emp.email?.trim().toLowerCase() === emailLower
    );`;

const loginReplace = `    // 2. Is this a registered employee?
    let matchedEmployee = dbEmployees.find(
      (emp: any) => emp.email?.trim().toLowerCase() === emailLower
    );
    
    // Fallback: direct query to Firestore if not found in local state (stale state issue)
    if (!matchedEmployee && db && db.type !== "dummy_firestore") {
      try {
        const q = query(collection(db, "employees"));
        const snapshot = await getDocs(q);
        const allEmps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        matchedEmployee = allEmps.find((emp: any) => emp.email?.trim().toLowerCase() === emailLower);
      } catch (e) {
        console.warn("Direct Firestore fallback query failed:", e);
      }
    }`;

content = content.replace(loginTarget, loginReplace);
fs.writeFileSync('src/components/AuthGate.tsx', content);
