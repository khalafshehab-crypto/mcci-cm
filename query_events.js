import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBbLUxGy1mosbv015JiZTSqpOwQP0CdVRU",
  authDomain: "mcci-cm-126e4.firebaseapp.com",
  projectId: "mcci-cm",
  storageBucket: "mcci-cm.firebasestorage.app",
  messagingSenderId: "850283799531",
  appId: "1:850283799531:web:d11fc33f4f27f25d586fae",
  measurementId: "G-MW58ZJ4KPK"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");

async function check() {
  const querySnapshot = await getDocs(collection(db, "events"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.title && data.title.includes("تدشين")) {
      console.log(doc.id, "=>", data.title, data.employees, data.googleEventIds, data.date);
    }
  });
  
  const empSnapshot = await getDocs(collection(db, "employees"));
  empSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.name && data.name.includes("ناجي")) {
      console.log("Found emp:", data.name, data.email);
    }
  });
}
check().catch(console.error).finally(() => process.exit(0));
