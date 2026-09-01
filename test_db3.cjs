const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function run() {
  const snap = await getDocs(collection(db, 'events'));
  const evts = snap.docs.map(d => d.data());
  const meetings = evts.filter(e => {
    const title = e.title || "";
    return title.includes("اجتماع") || title.startsWith("اجتماع");
  });
  console.log("Found meetings:", meetings.length);
  console.log(evts[0].title);
}
run().catch(console.error);
