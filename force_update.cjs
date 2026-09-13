const { initializeApp } = require('firebase/app');
const { getFirestore, getDocs, collection, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBbLUxGy1mosbv015JiZTSqpOwQP0CdVRU",
  authDomain: "mcci-cm-126e4.firebaseapp.com",
  projectId: "mcci-cm"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");
// let's actually just let the user trigger it from the UI so they see the toast success. I don't need to force an update.
