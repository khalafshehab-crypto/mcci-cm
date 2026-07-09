import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('/app/applet/firebase-applet-config.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const eventsSnap = await db.collection('events').get();
  const allEvents = [];
  eventsSnap.forEach(doc => allEvents.push({ id: doc.id, ...doc.data() }));

  const chosenEvent = allEvents.find(e => e.title && e.title.includes("التأسيسي") && e.title.includes("الحج والعمرة"));
  if (!chosenEvent) return console.log("Event not found");

  console.log("Chosen Event:", chosenEvent.title, chosenEvent.id);

  const agendaRecsForCards = (chosenEvent.agenda || [])
    .filter(item => item.recommendation && item.recommendation.trim() !== "")
    .map((item, index) => {
      return {
        id: `custom-rec-${chosenEvent.id}-${item.id || index}`,
        title: `توصية البند ${index + 1} "${item.title}"`,
        description: item.recommendation,
        isAgendaSource: true
      };
    });

  const standaloneLinkedRecs = allEvents
    .filter(e => !!e.recommendationType && String(e.recommendationEventId) === String(chosenEvent.id))
    .map(e => ({
        id: e.id,
        title: e.title || "توصية غير مسماة",
        description: e.description || e.notes || "",
        isRealEvent: false
    }));

  const recSnap = await db.collection('recommendations').get();
  const dbRecommendations = [];
  recSnap.forEach(doc => {
     const data = doc.data();
     if (String(doc.id).startsWith(`custom-rec-${chosenEvent.id}-`) || data.eventName === chosenEvent.title) {
         dbRecommendations.push({ id: doc.id, ...data });
     }
  });

  console.log("\n--- Agenda Recs ---");
  console.table(agendaRecsForCards);
  console.log("\n--- Standalone Recs ---");
  console.table(standaloneLinkedRecs);
  console.log("\n--- DB Recs ---");
  console.table(dbRecommendations);
}
run();
