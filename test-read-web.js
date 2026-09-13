import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(serviceAccount);
const db = getFirestore(app);

async function run() {
  try {
    const comms = await getDocs(collection(db, 'committees'));
    console.log('Committees read:', comms.size);
    const events = await getDocs(collection(db, 'events'));
    console.log('Events read:', events.size);
    process.exit(0);
  } catch (e) {
    console.error('Read failed:', e.message);
    process.exit(1);
  }
}
run();
