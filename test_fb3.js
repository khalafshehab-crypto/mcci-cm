import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const configSource = fs.readFileSync("firebase-applet-config.json", "utf8");
const config = JSON.parse(configSource);

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const querySnapshot = await getDocs(collection(db, "join_requests"));
    console.log("Found", querySnapshot.size, "join requests");
    querySnapshot.forEach(doc => console.log(doc.id, doc.data()));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
