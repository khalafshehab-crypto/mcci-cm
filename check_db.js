import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const empSnap = await getDocs(collection(db, "employees"));
  const emps = empSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
  console.log("Employees:", emps);
  
  const eventsSnap = await getDocs(collection(db, "events"));
  const events = eventsSnap.docs.map(doc => doc.data());
  const recentEvent = events.filter(e => e.committeeName && e.committeeName.includes("العقاري")).sort((a,b) => b.id - a.id)[0];
  console.log("Recent Event:", JSON.stringify(recentEvent, null, 2));
  
  process.exit(0);
}
check();
