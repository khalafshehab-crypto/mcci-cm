import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function list() {
  try {
    const snap = await getDocs(collection(db, "templates"));
    const templates = [];
    snap.forEach(d => {
      templates.push({ id: d.id, ...d.data() });
    });
    console.log("Found", templates.length, "templates");
    
    // Check duplicates based on title and type
    const seen = new Set();
    let dups = 0;
    for (const t of templates) {
      if (t.type === "تعميم") {
         console.log(`- ${t.title} [${t.id}] -> committees: ${t.committeeUrls?.length || 0}`);
      }
    }
  } catch(e) {
    console.error(e);
  }
}
list();
