import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

const dbDefault = getFirestore(app, "(default)");
const dbCustom = getFirestore(app, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");

async function check() {
  try { await signInAnonymously(auth); console.log("Anon auth OK"); } catch(e) { console.log("Anon auth fail", e.message); }
  
  try {
    const snap = await getDocs(collection(dbDefault, "committees"));
    console.log("default DB committees size:", snap.size);
  } catch(e) {
    console.log("default DB err:", e.message);
  }

  try {
    const snap2 = await getDocs(collection(dbCustom, "committees"));
    console.log("custom DB committees size:", snap2.size);
  } catch(e) {
    console.log("custom DB err:", e.message);
  }
  process.exit(0);
}
check();
