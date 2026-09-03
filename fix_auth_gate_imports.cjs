const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');
code = code.replace(/import \{ db, auth, getFirebaseEmps, setFirebaseEmpDoc, logSystemAction \} from "\.\.\/lib\/firebase";/, 
  "import { db, auth, getFirebaseEmps, setFirebaseEmpDoc, logSystemAction, doc, setDoc } from \"../lib/firebase\";");
fs.writeFileSync('src/components/AuthGate.tsx', code);
