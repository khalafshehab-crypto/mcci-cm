const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "mcci-cm" // This usually requires the full config, let me check firebase.ts
};
