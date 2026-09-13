import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  try {
    await signInAnonymously(auth);
    console.log("Logged in anonymously:", auth.currentUser.uid);
  } catch (e) {
    console.error("Auth error:", e.message);
  }

  try {
    const snap = await getDocs(collection(db, "tasks"));
    console.log("Read tasks:", snap.size);
  } catch(e) {
    console.error("DB error:", e.message);
  }
  process.exit(0);
}
run();
