const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'events'));
  const events = snap.docs.map(d => d.data());
  console.log(events.slice(0, 3));
  console.log("Total events:", events.length);
  const withTitle = events.filter(e => e.title).length;
  const withName = events.filter(e => e.eventName).length;
  console.log("With title:", withTitle, "With eventName:", withName);
}
run().catch(console.error);
