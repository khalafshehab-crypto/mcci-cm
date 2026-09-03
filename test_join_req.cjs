const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = await addDoc(collection(db, "join_requests"), {
      test: "unauth_write",
      timestamp: new Date().toISOString()
    });
    console.log("SUCCESS! Created doc:", docRef.id);
  } catch (e) {
    console.error("ERROR:", e.code, e.message);
  }
}

test();
