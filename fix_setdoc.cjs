const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

// We currently have:
// import { collection, getDocs, addDoc, query, where } from "../lib/firebase";
// import { doc, setDoc } from "firebase/firestore";

code = code.replace(/import \{ doc, setDoc \} from "firebase\/firestore";/, 'import { doc } from "firebase/firestore";\nimport { setDoc } from "../lib/firebase";');

fs.writeFileSync('src/components/AuthGate.tsx', code);
