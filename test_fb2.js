import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const configSource = fs.readFileSync("firebase-applet-config.json", "utf8");
const config = JSON.parse(configSource);

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const querySnapshot = await getDocs(collection(db, "employees"));
    console.log("Found", querySnapshot.size, "employees");
  } catch (e) {
    console.error("Error fetching employees:", e.message);
  }
}

run();
