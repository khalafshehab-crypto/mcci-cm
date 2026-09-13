import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, initializeFirestore } from 'firebase/firestore';

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
  const d = await getDoc(doc(db, "events", "1789035171812"));
  console.log(d.data());
}
check().catch(console.error).finally(() => process.exit(0));
