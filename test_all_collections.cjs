const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

const collectionsToTest = [
  "employees", "committees", "events", "tasks", "recommendations", "members",
  "templates", "reports", "kpis", "system_logs", "approved_emails", "join_requests",
  "delegations", "centers_events", "centers_list", "affiliates_events", "affiliates_list",
  "secgen_events", "secgen_list", "employee_tokens", "system_settings", "test_collection_123"
];

async function run() {
  for (const col of collectionsToTest) {
    try {
      const docRef = await addDoc(collection(db, col), { test: true });
      console.log(`SUCCESS: Collection '${col}' is writable! ID: ${docRef.id}`);
    } catch (e) {
      console.log(`FAILED: Collection '${col}' - ${e.code}`);
    }
  }
  process.exit(0);
}
run();
