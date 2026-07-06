import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";
import * as fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  const commSnap = await getDocs(collection(db, "committees"));
  const commNames = commSnap.docs.map(d => d.data().name);
  console.log("Current committees in DB:", commNames);

  const employeesSnap = await getDocs(collection(db, "employees"));
  for (const d of employeesSnap.docs) {
    const data = d.data();
    if (data.committees) {
      const validComms = Array.from(new Set(data.committees.filter(c => commNames.includes(c))));
      if (validComms.length !== data.committees.length) {
        console.log(`Fixing Employee ${data.name}. Old:`, data.committees, "New:", validComms);
        await updateDoc(doc(db, "employees", d.id), { committees: validComms });
      }
    }
  }

  const membersSnap = await getDocs(collection(db, "members"));
  for (const d of membersSnap.docs) {
    const data = d.data();
    if (!commNames.includes(data.committeeName)) {
      console.log(`Member ${data.name} has invalid committee: ${data.committeeName}`);
      // Wait, if it's invalid, what should we do? Delete it? 
      // If we don't know the new name, we can't map it.
      // But maybe the user meant that some members still have the old name. 
      // How do we map it? Maybe we can ask the user or just leave it for the user to delete.
      // Actually, if we look at commNames, can we guess the mapping?
    }
  }
}

fix().then(() => {
    console.log("Done");
    process.exit(0);
}).catch(console.error);
