import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const querySnapshot = await getDocs(collection(db, "members"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if(data.name && data.name.includes('مروان')) {
      console.log('Marwan data:', data);
    }
  });
  process.exit(0);
}
run();
