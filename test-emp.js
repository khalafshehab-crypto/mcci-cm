import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const dbCustom = getFirestore(app, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");

async function check() {
  try {
    const snap = await getDocs(collection(dbCustom, "employees"));
    const data = snap.docs.map(d => d.data());
    data.forEach(d => console.log(d.name, "orgLevel:", d.orgLevel1, d.orgLevel2, d.orgLevel3, d.orgLevel4));
  } catch(e) { console.log(e.message); }
  process.exit(0);
}
check();
