import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
     const docRef = doc(db, "system_settings", "google_workspace");
     const snap = await getDoc(docRef);
     console.log("system token exists:", snap.exists());
  } catch (e) {
     console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
