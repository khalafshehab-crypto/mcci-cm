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
  const collections = ['members', 'users', 'committees', 'events', 'recommendations', 'tasks'];
  for (const collName of collections) {
    console.log(`Checking ${collName}...`);
    const snapshot = await getDocs(collection(db, collName));
    const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.forEach(d => {
      const str = JSON.stringify(d);
      if (str.includes("فقيها")) {
         console.log(`Found in ${collName} id=${d.id} name=${d.name || d.title}`);
      }
    });
  }
  process.exit(0);
}

main().catch(console.error);
