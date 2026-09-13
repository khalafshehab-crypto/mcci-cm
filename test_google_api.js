import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, initializeFirestore } from 'firebase/firestore';
import fetch from 'node-fetch';

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

async function getToken() {
  const docRef = doc(db, "system_settings", "google_workspace");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data().token;
  }
  return null;
}

async function run() {
  const token = await getToken();
  if (!token) {
    console.log("No token found");
    return;
  }
  
  const payload = {
    summary: "Test Event",
    description: "Testing",
    start: { dateTime: "2026-09-16T13:30:00", timeZone: "Asia/Riyadh" },
    end: { dateTime: "2026-09-16T14:30:00", timeZone: "Asia/Riyadh" },
    attendees: [{email: "a.naji@makkahcci.org.sa"}]
  };
  
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
       'Authorization': 'Bearer ' + token,
       'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

run().catch(console.error).finally(() => process.exit(0));
