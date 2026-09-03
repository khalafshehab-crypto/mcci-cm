const fs = require('fs');

let c = fs.readFileSync('src/lib/firebase.ts', 'utf8');

c = c.replace(/export async function getDoc\([\s\S]*?\}\n\}/, `export async function getDoc(docRef: any): Promise<any> {
  return fbGetDoc(docRef);
}`);

c = c.replace(/export async function getCountFromServer\([\s\S]*?\}\n\}/, `export async function getCountFromServer(queryOrColRef: any): Promise<any> {
  return fbGetCountFromServer(queryOrColRef);
}`);

fs.writeFileSync('src/lib/firebase.ts', c);
