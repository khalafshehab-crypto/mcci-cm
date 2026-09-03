import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";

const configSource = fs.readFileSync("firebase-applet-config.json", "utf8");
const config = JSON.parse(configSource);

const app = initializeApp(config);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

async function run() {
  try {
    const docRef = await addDoc(collection(db, "join_requests"), {
      name: "Test Name",
      email: "test@example.com",
      phone: "123456789",
      requestedRole: "SPECIALIST",
      requestDate: new Date().toISOString()
    });
    console.log("Success! ID:", docRef.id);
  } catch (e) {
    console.error("Error adding:", e.message);
  }
}
run().then(() => process.exit(0));
