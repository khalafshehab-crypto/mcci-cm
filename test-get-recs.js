import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Read the credentials
const serviceAccount = JSON.parse(readFileSync('/app/applet/firebase-applet-config.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const eventsSnap = await db.collection('events').get();
  console.log("Events count:", eventsSnap.size);
  eventsSnap.forEach(doc => {
    const data = doc.data();
    if (data.title && data.title.includes("التأسيسي")) {
      console.log("Event:", data.title, data.id);
      if (data.agenda) {
        console.log("Agenda length:", data.agenda.length);
        data.agenda.forEach(a => console.log(" -", a.title, "Rec:", a.recommendation));
      }
    }
  });

  const recSnap = await db.collection('recommendations').get();
  console.log("Recommendations count:", recSnap.size);
  recSnap.forEach(doc => {
     console.log("Rec ID:", doc.id, "EventName:", doc.data().eventName, "Title:", doc.data().title);
  });
}
run();
