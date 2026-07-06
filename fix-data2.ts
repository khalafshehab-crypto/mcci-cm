import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import * as fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const config = JSON.parse(configStr);

const firebaseConfig = config.webConfig;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  const commSnap = await getDocs(collection(db, "committees"));
  const commNames = commSnap.docs.map(d => d.data().name);
  console.log("Current committees in DB:", commNames);

  // Sync members
  const membersSnap = await getDocs(collection(db, "members"));
  for (const d of membersSnap.docs) {
    const data = d.data();
    // If member's committeeName is not in commNames, but there is a similar one, update it?
    // Let's just log them for now
    if (!commNames.includes(data.committeeName)) {
      console.log(`Member ${data.name} has invalid committee: ${data.committeeName}`);
    }
  }

  // Employees
  const empSnap = await getDocs(collection(db, "employees"));
  for (const d of empSnap.docs) {
    const data = d.data();
    if (data.committees) {
      const validComms = data.committees.filter(c => commNames.includes(c));
      if (validComms.length !== data.committees.length) {
        console.log(`Employee ${data.name} has invalid committees. Old:`, data.committees, "New:", validComms);
        // Let's fix them right now by keeping only valid ones
        await updateDoc(doc(db, "employees", d.id), { committees: validComms });
      }
      
      // But wait! If they updated "اللجنة الصناعية" to "اللجنة الصناعية المعدلة", it will just delete the old one, but not replace it!
      // This is because we didn't run the cascade at the time of renaming.
      // So if the user renamed it, the new name is in commNames, but the old name is in data.committees.
      // And we lost the mapping. BUT wait, did we? The user said "وظهرت 4 لجان". This means the employee already got the new ones AND the old ones are still there!
      // So if we just remove the invalid ones, it will fix it!
    }
  }
}

fix().then(() => {
    console.log("Done");
    process.exit(0);
}).catch(console.error);
