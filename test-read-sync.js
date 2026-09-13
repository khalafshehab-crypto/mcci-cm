import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(serviceAccount);
const db = getFirestore(app, (serviceAccount.firestoreDatabaseId || "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675"));
const auth = getAuth(app);

async function run() {
  try {
    const tasksSnap = await getDocs(collection(db, "tasks"));
    console.log('Tasks read:', tasksSnap.size);
    const eventCollections = ["events", "centers_events", "assistant_sec_gen_events", "affiliates_events"];
    for (const collName of eventCollections) {
      const eventsSnap = await getDocs(collection(db, collName));
      console.log(`${collName} read:`, eventsSnap.size);
    }
    process.exit(0);
  } catch (e) {
    console.error('Read failed:', e.message);
    process.exit(1);
  }
}
run();
