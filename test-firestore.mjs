import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";
const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || "(default)");
getDocs(collection(db, "system_logs")).then(() => {
  console.log("SUCCESS");
  process.exit(0);
}).catch(e => {
  console.error("FAIL", e);
  process.exit(1);
});
