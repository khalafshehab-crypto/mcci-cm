import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const db = getFirestore();

async function check() {
  const empSnap = await db.collection("employees").get();
  console.log("Employees:", empSnap.docs.map(d => ({id: d.id, email: d.data().email, active: d.data().active})));

  const reqSnap = await db.collection("join_requests").get();
  console.log("Join Requests:", reqSnap.docs.map(d => ({id: d.id, email: d.data().email, name: d.data().name, status: d.data().status})));
}

check().catch(console.error);
