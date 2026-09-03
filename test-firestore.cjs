const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.projectId,
    clientEmail: "test@example.com", // fake
    privateKey: "fake" // fake
  })
});
// wait, I don't have the service account key. 
