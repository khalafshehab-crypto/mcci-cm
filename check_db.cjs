const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675"); // Pass database ID explicitly

async function run() {
  const snap = await getDocs(collection(db, 'members'));
  const mbrs = snap.docs.map(d => d.data());
  
  console.log("Total members:", mbrs.length);
  
  const womenMbrs = mbrs.filter(m => {
    const title = (m.title || "").trim();
    const name = (m.name || "").trim();
    const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
    if (womenTitles.includes(title)) return true;
    if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) return true;
    return false;
  });
  
  console.log("Women found:", womenMbrs.length);
  if(womenMbrs.length > 0) {
    console.log("Sample woman:", womenMbrs[0]);
  }
}
run().catch(console.error);
