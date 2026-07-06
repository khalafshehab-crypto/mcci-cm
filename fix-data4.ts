import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const employeesSnap = await getDocs(collection(db, "employees"));
  for (const d of employeesSnap.docs) {
    const data = d.data();
    if (data.name.includes('خلف')) {
       console.log(data.name, data.committees);
    }
  }
}

check().then(() => {
    process.exit(0);
}).catch(console.error);
