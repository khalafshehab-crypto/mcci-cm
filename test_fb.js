import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
     console.log("Checking token");
     const tokenRef = doc(db, "employee_tokens", "abdulaziz@example.com");
     const snap = await getDoc(tokenRef);
     console.log("abdulaziz token exists:", snap.exists());
  } catch (e) {
     console.log("Error:", e.message);
  }
  process.exit(0);
}
run();
