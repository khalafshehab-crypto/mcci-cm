const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

code = code.replace(
  'export { getCountFromServer } from "firebase/firestore";',
  `import { getCountFromServer as fbGetCountFromServer } from "firebase/firestore";

export async function getCountFromServer(queryOrColRef: any): Promise<any> {
  if (isUseMock()) {
    return { data: () => ({ count: 0 }) };
  }
  try {
    const { result, timedOut } = await withTimeout(fbGetCountFromServer(queryOrColRef), 8000);
    if (timedOut) {
      return { data: () => ({ count: 0 }) };
    }
    return result;
  } catch (e) {
    console.warn("getCountFromServer fallback on crash", e);
    return { data: () => ({ count: 0 }) };
  }
}`
);

fs.writeFileSync('src/lib/firebase.ts', code);
console.log("Patched getCountFromServer");
