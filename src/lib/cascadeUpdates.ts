import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function cascadeCommitteeRename(oldName: string, newName: string) {
  if (!oldName || !newName || oldName === newName) return;

  try {
    const updateCollectionByField = async (collectionName: string, fieldName: string) => {
      const q = query(collection(db, collectionName), where(fieldName, "==", oldName));
      const snap = await getDocs(q);
      const promises = snap.docs.map(d => updateDoc(doc(db, collectionName, d.id), { [fieldName]: newName }));
      await Promise.all(promises);
    };

    await Promise.all([
      updateCollectionByField("members", "committeeName"),
      updateCollectionByField("events", "committeeName"),
      updateCollectionByField("recommendations", "committeeName"),
      updateCollectionByField("tasks", "committeeName"),
      updateCollectionByField("reports", "committeeName"),
      updateCollectionByField("kpis", "committeeName"),
      updateCollectionByField("templates", "committeeName"),
      updateCollectionByField("delegations", "committeeName")
    ]);

    // Handle employees array
    const empSnap = await getDocs(collection(db, "employees"));
    const empPromises = empSnap.docs.map(async (d) => {
      const data = d.data();
      if (data.committees && data.committees.includes(oldName)) {
        const newComms = data.committees.map((c: string) => c === oldName ? newName : c);
        await updateDoc(doc(db, "employees", d.id), { committees: newComms });
      }
    });
    await Promise.all(empPromises);

  } catch (error) {
    console.error("Failed to cascade rename:", error);
  }
}
