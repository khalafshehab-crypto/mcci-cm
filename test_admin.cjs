const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('join_requests').get();
  console.log("Found", snapshot.size, "join requests");
  snapshot.forEach(doc => console.log(doc.id, doc.data()));
}
run().catch(console.error);
