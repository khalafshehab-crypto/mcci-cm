const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const querySnapshot = await getDocs(collection(db, "templates"));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data().title, doc.data().committeeUrls?.length);
  });
}
check();
