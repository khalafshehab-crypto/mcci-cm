import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(serviceAccount);
const db = getFirestore(app); // default DB
const auth = getAuth(app);

async function run() {
  try {
    const creds = await signInWithEmailAndPassword(auth, "khalafshehab@gmail.com", "123456");
    console.log("Logged in!");
  } catch(e) {
    console.log("Login failed:", e.message);
  }
  
  try {
    const snap = await getDocs(collection(db, "tasks"));
    console.log(`Tasks OK: ${snap.size}`);
  } catch(e) {
    console.log(`Tasks FAIL: ${e.message}`);
  }
  process.exit(0);
}
run();
