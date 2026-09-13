const fs = require('fs');

const file = '/app/applet/src/lib/googleApi.ts';
let content = fs.readFileSync(file, 'utf8');

const oldConnect = `  // Save to Firestore so other employees can use it
  try {
     const docRef = doc(db, "system_settings", "google_workspace");
     await setDoc(docRef, {
       token: credential.accessToken,
       timestamp: Date.now()
     }, { merge: true });
  } catch(e) {
     console.warn("Failed to share token in Firestore", e);
  }`;

const newConnect = `  try {
    localStorage.setItem("google_access_token", credential.accessToken);
  } catch(e) {}`;

content = content.replace(oldConnect, newConnect);

fs.writeFileSync(file, content);
console.log('Updated connectGoogleWorkspace in googleApi.ts');
