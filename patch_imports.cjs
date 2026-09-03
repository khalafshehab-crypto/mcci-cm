const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

code = code.replace(
  /import \{ useFirestoreCollection \} from "\.\.\/lib\/firebaseUtils";/,
  `import { useFirestoreCollection } from "../lib/firebaseUtils";\nimport { collection, getDocs, query, where } from "firebase/firestore";\nimport { db } from "../lib/firebase";`
);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
