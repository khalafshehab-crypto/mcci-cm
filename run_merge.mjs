import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "mcci-cm",
  appId: "1:850283799531:web:70b2792f1c7008bf586fae",
  apiKey: "AIzaSyBbLUxGy1mosbv015JiZTSqpOwQP0CdVRU",
  authDomain: "mcci-cm-126e4.firebaseapp.com",
  storageBucket: "mcci-cm.firebasestorage.app",
  messagingSenderId: "850283799531"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");

async function main() {
  const snapshot = await getDocs(collection(db, 'members'));
  const members = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const ahmad = members.filter(m => m.name && m.name.includes("فقيها"));
  console.log("Found:", ahmad.length);
  
  for (const m of ahmad) {
    console.log(m.id, m.name, m.email, m.phone, m.committeeId, m.secondaryCommitteeId);
  }
  
  // Group by name
  const dupes = {};
  members.forEach(m => {
    let key = m.name?.trim();
    if (!key) return;
    if (!dupes[key]) dupes[key] = [];
    dupes[key].push(m);
  });
  
  let deletedCount = 0;
  for (const key in dupes) {
    if (dupes[key].length > 1) {
      console.log(`\nDuplicate name: ${key}`);
      const primary = dupes[key][0];
      let updated = false;
      let secondaryId = primary.secondaryCommitteeId;
      let secondaryName = primary.secondaryCommitteeName;
      
      for (let i = 1; i < dupes[key].length; i++) {
        const dup = dupes[key][i];
        console.log(`  - Dup: ${dup.id} (comm: ${dup.committeeId})`);
        if (dup.committeeId !== primary.committeeId && (!secondaryId || secondaryId === 0 || secondaryId === "")) {
          secondaryId = dup.committeeId;
          secondaryName = dup.committeeName;
          updated = true;
        }
        await deleteDoc(doc(db, 'members', dup.id));
        deletedCount++;
        console.log(`  -> Deleted ${dup.id}`);
      }
      
      if (updated) {
        await updateDoc(doc(db, 'members', primary.id), {
          secondaryCommitteeId: secondaryId,
          secondaryCommitteeName: secondaryName
        });
        console.log(`  -> Updated primary ${primary.id} with secondary comm ${secondaryName}`);
      }
    }
  }
  
  console.log(`Deleted ${deletedCount} duplicates.`);
  process.exit(0);
}

main().catch(console.error);
