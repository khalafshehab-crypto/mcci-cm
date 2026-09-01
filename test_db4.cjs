const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function run() {
  const snap = await getDocs(collection(db, 'events'));
  const evts = snap.docs.map(d => d.data());
  evts.slice(0, 5).forEach(e => {
    console.log("title:", e.title, "| eventName:", e.eventName);
  });
  console.log("Totals -> title:", evts.filter(e => e.title).length, "eventName:", evts.filter(e => e.eventName).length);
}
run().catch(console.error);
