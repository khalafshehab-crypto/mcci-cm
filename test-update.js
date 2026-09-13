import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(serviceAccount);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  await signInAnonymously(auth);
  console.log('Signed in as', auth.currentUser.uid);
  
  const tasks = await getDocs(collection(db, 'tasks'));
  console.log('Tasks read:', tasks.size);
  
  if (tasks.size > 0) {
    const t = tasks.docs[0];
    try {
      await updateDoc(doc(db, 'tasks', t.id), { testField: 'test' });
      console.log('Update success');
    } catch (e) {
      console.error('Update failed:', e.message);
    }
  }
  process.exit(0);
}
run();
