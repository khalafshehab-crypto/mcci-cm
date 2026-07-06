import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, "tasks"));
  console.log("Tasks:");
  for (const d of snap.docs) {
    console.log(d.id, d.data().title, d.data().committeeName);
  }
}

check().then(() => process.exit(0)).catch(console.error);
