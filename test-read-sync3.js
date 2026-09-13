import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(serviceAccount);
const db = getFirestore(app, "(default)");

async function check(name) {
  try {
    const snap = await getDocs(collection(db, name));
    console.log(`${name} OK: ${snap.size}`);
  } catch(e) {
    console.log(`${name} FAIL: ${e.message}`);
  }
}

async function run() {
  await check("tasks");
  await check("events");
  await check("centers_events");
  await check("assistant_sec_gen_events");
  await check("affiliates_events");
  process.exit(0);
}
run();
