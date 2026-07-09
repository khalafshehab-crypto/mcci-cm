const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = initializeApp();
const db = getFirestore(app);
async function run() {
  const snapshot = await db.collection('recommendations').get();
  console.log("Recommendations count:", snapshot.size);
  snapshot.forEach(doc => console.log(doc.id, doc.data().eventName, doc.data().title));
}
run();
