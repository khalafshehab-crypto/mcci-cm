import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import fs from "fs";

const configSource = fs.readFileSync("firebase-applet-config.json", "utf8");
const config = JSON.parse(configSource);

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  console.log("Verifying join_requests collection...");
  try {
    const q = query(collection(db, "join_requests"));
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} total join requests in Firestore.`);
    querySnapshot.forEach(doc => {
      console.log(`- ID: ${doc.id}`);
      console.log(`  Data:`, doc.data());
    });
  } catch (e) {
    console.error("Firestore Error:", e.message);
  }
}
run().then(() => process.exit(0));
