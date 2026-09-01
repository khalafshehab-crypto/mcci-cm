const fs = require('fs');
const path = 'src/lib/firebase.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('enableMultiTabIndexedDbPersistence')) {
  // Add import
  code = code.replace(
    'import { \n  initializeFirestore as fbInitializeFirestore,',
    'import { \n  initializeFirestore as fbInitializeFirestore,\n  enableMultiTabIndexedDbPersistence,'
  );

  // Add activation code
  const offlineCode = `try {
  db = fbInitializeFirestore(app, { experimentalForceLongPolling: true }, firebaseAppletConfig.firestoreDatabaseId || "(default)");
  if (db) {
    db.isBlocked = !db || db.type === "dummy_firestore";
    // Enable Offline Mode
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
        } else if (err.code === 'unimplemented') {
            console.warn("The current browser does not support all of the features required to enable persistence");
        }
    });
  }
} catch (e) {`;

  code = code.replace(
    /try \{\n  db = fbInitializeFirestore\(app.*?catch \(e\) \{/s,
    offlineCode
  );

  fs.writeFileSync(path, code);
  console.log("Patched firebase.ts for Offline Mode");
}
