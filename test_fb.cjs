const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const config = require("./firebase-applet-config.json");
try {
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId || "(default)");
  console.log("Success!");
} catch(e) {
  console.error("Error:", e);
}
