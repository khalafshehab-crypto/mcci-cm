const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

// Initialize without credentials will use the default credentials in this environment
admin.initializeApp({
  projectId: serviceAccount.projectId
});

const db = admin.firestore();
db.collection('committees').get().then(snap => {
  console.log('Read success:', snap.size);
}).catch(e => {
  console.error('Read failed:', e.message);
});
