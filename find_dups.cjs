const fs = require('fs');

async function checkDups() {
  const firebaseAdmin = require('firebase-admin');
  const serviceAccount = require('./serviceAccountKey.json');
  
  if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount)
    });
  }
  
  const db = firebaseAdmin.firestore();
  const membersRef = db.collection('members');
  const snapshot = await membersRef.get();
  const members = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  
  const dupes = {};
  members.forEach(m => {
     let key = m.phone.trim();
     if (!key) key = m.email.trim();
     if (!key) return;
     if (!dupes[key]) dupes[key] = [];
     dupes[key].push(m);
  });
  
  for (const key in dupes) {
     if (dupes[key].length > 1) {
        console.log("Duplicate found for key:", key);
        dupes[key].forEach(m => console.log(m.id, m.name, m.committeeName, m.secondaryCommitteeName));
     }
  }
}
checkDups().catch(console.error);
