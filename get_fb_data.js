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
     if(snap.exists()) {
        const data = snap.data();
        if(data.access_token) {
           console.log("system_settings token:", data.access_token.substring(0, 20) + "...");
        } else {
           console.log("system_settings token: (none)");
        }
     } else {
        console.log("system_settings doc does not exist.");
     }
  } catch (e) {
     console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
