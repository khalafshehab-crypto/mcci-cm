const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = initializeApp({
  projectId: "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675"
});
const db = getFirestore(app);
async function run() {
  try {
    const snapshot = await db.collection('recommendations').get();
    console.log("Recommendations count:", snapshot.size);
    snapshot.forEach(doc => console.log(doc.id, doc.data().eventName, doc.data().title));
  } catch (e) { console.error(e); }
}
run();
