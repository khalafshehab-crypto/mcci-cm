import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('/app/applet/firebase-applet-config.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const evts = await db.collection('events').get();
  console.log("Events count:", evts.size);
  evts.forEach(doc => {
    const data = doc.data();
    if (data.title && data.title.includes("التأسيسي") && data.committeeName && data.committeeName.includes("الحج")) {
      console.log("Event:", data.title, data.id, "Agenda length:", data.agenda ? data.agenda.length : 0);
      if (data.agenda) {
        data.agenda.forEach((a, i) => console.log(" Agenda", i, "Rec:", a.recommendation));
      }
    }
  });

  const recs = await db.collection('recommendations').get();
  console.log("Recommendations in DB:", recs.size);
  recs.forEach(doc => {
    const data = doc.data();
    if (data.committeeName && data.committeeName.includes("الحج")) {
      console.log("Rec ID:", doc.id, "Event:", data.eventName, "Title:", data.title);
    }
  });
}
run();
