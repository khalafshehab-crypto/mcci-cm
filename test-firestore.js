const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || "(default)");
getDocs(collection(db, "system_logs")).then(() => {
  console.log("SUCCESS");
  process.exit(0);
}).catch(e => {
  console.error("FAIL", e);
  process.exit(1);
});
