const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');
code = code.replace(/import \{ db, auth, getFirebaseEmps, setFirebaseEmpDoc, logSystemAction, doc, setDoc \} from "\.\.\/lib\/firebase";/, 
  "import { db, auth, getFirebaseEmps, setFirebaseEmpDoc, logSystemAction } from \"../lib/firebase\";\nimport { doc, setDoc } from \"firebase/firestore\";");
// Also if my previous replace failed:
if (!code.includes("import { doc, setDoc } from \"firebase/firestore\";")) {
  code = "import { doc, setDoc } from \"firebase/firestore\";\n" + code;
}
fs.writeFileSync('src/components/AuthGate.tsx', code);
