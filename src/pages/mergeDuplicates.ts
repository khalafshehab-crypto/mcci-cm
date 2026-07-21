import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';


export const mergeDuplicateMembers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'members'));
    const members = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
    
    const dupes: Record<string, any[]> = {};
    members.forEach(m => {
      let key = m.email?.trim()?.toLowerCase();
      if (!key) key = m.phone?.trim();
      if (!key) key = m.nationalId?.trim();
      if (!key) return;
      if (!dupes[key]) dupes[key] = [];
      dupes[key].push(m);
    });
    
    for (const key in dupes) {
      if (dupes[key].length > 1) {
        // Keep the first, update it, delete the rest
        const primary = dupes[key][0];
        let updated = false;
        let secondaryId = primary.secondaryCommitteeId;
        let secondaryName = primary.secondaryCommitteeName;
        
        for (let i = 1; i < dupes[key].length; i++) {
          const dup = dupes[key][i];
          if (dup.committeeId !== primary.committeeId && (!secondaryId || secondaryId === 0 || secondaryId === "")) {
            secondaryId = dup.committeeId;
            secondaryName = dup.committeeName;
            updated = true;
          }
          console.log(`Deleting duplicate member ${dup.id} (${dup.name})`);
          await deleteDoc(doc(db, 'members', dup.id));
        }
        
        if (updated) {
          console.log(`Updating primary member ${primary.id} (${primary.name}) with secondary comm ${secondaryName}`);
          await updateDoc(doc(db, 'members', primary.id), {
            secondaryCommitteeId: secondaryId,
            secondaryCommitteeName: secondaryName
          });
        }
      }
    }
    console.log("Merge completed");
  } catch (err) {
    console.error("Merge failed", err);
  }
}
