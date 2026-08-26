const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(
  'export { getDocs } from "firebase/firestore";',
  `import { getDocs as fbGetDocs } from "firebase/firestore";

export async function getDocs(queryOrColRef: any): Promise<any> {
  if (isUseMock()) {
    return { docs: [], forEach: (cb) => {} };
  }
  try {
    const { result, timedOut } = await withTimeout(fbGetDocs(queryOrColRef), 8000);
    if (timedOut) {
      return { docs: [], forEach: (cb) => {} };
    }
    return result;
  } catch (e) {
    console.warn("getDocs fallback on crash", e);
    return { docs: [], forEach: (cb) => {} };
  }
}`
);

fs.writeFileSync('src/lib/firebase.ts', code);
console.log("Patched getDocs");
