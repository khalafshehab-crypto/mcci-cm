import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const dbCustom = getFirestore(app, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");

async function check() {
  try {
    await signInWithEmailAndPassword(auth, "khalafshehab@gmail.com", "123456");
    const snap = await getDocs(collection(dbCustom, "org_structure"));
    snap.docs.forEach(d => console.log(d.data()));
  } catch(e) { console.log(e.message); }
  process.exit(0);
}
check();
