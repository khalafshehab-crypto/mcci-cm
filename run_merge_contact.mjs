import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "mcci-cm",
  appId: "1:850283799531:web:70b2792f1c7008bf586fae",
  apiKey: "AIzaSyBbLUxGy1mosbv015JiZTSqpOwQP0CdVRU",
  authDomain: "mcci-cm-126e4.firebaseapp.com",
  storageBucket: "mcci-cm.firebasestorage.app",
  messagingSenderId: "850283799531"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");

async function main() {
  const snapshot = await getDocs(collection(db, 'members'));
  const members = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const ahmad = members.filter(m => m.name && m.name.includes("فقيها"));
  console.log("Ahmad Faqiha search:");
  for (const m of ahmad) {
    console.log(m.id, m.name, m.email, m.phone, m.committeeId, m.secondaryCommitteeId);
  }
}

main().catch(console.error);
