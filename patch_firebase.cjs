const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

if (!content.includes('fbGetDoc')) {
    content = content.replace(
        'setDoc as fbSetDoc',
        'setDoc as fbSetDoc, getDoc as fbGetDoc'
    );
}

if (!content.includes('export async function getDoc')) {
    content += `
export async function getDoc(docRef: any): Promise<any> {
  if (isUseMock()) {
    return mockFb.getDoc ? mockFb.getDoc(docRef) : { exists: () => false, data: () => null };
  }
  try {
    const { result, timedOut } = await withTimeout(fbGetDoc(docRef), 8000);
    if (timedOut) {
      return mockFb.getDoc ? mockFb.getDoc(docRef) : { exists: () => false, data: () => null };
    }
    return result;
  } catch (e) {
    console.warn("getDoc fallback on crash", e);
    return mockFb.getDoc ? mockFb.getDoc(docRef) : { exists: () => false, data: () => null };
  }
}
`;
}

fs.writeFileSync('src/lib/firebase.ts', content);
console.log("Patched firebase.ts with getDoc");
