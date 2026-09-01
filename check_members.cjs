const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'members'));
  const mbrs = snap.docs.map(d => d.data());
  
  console.log("Total members:", mbrs.length);
  console.log("Sample 1:", mbrs[0]);
  
  const womenMbrs1 = mbrs.filter(m => m.title && ["أستاذة", "دكتورة", "مهندسة", "سيدة"].includes(m.title));
  const womenMbrs2 = mbrs.filter(m => m.name && (m.name.includes("استاذة") || m.name.includes("أستاذة") || m.name.includes("دكتورة")));
  console.log("Women found by title field:", womenMbrs1.length);
  console.log("Women found by name field:", womenMbrs2.length);
  
  // Let's print all unique titles
  const titles = new Set(mbrs.map(m => m.title).filter(Boolean));
  console.log("Unique titles:", Array.from(titles));
}
run().catch(console.error);
