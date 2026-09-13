import { initializeApp as fbInitializeApp } from "firebase/app";
import { getAuth as fbGetAuth } from "firebase/auth";
import { 
  initializeFirestore as fbInitializeFirestore,
  enableMultiTabIndexedDbPersistence, getFirestore as fbGetFirestore,
  collection as fbCollection, 
  onSnapshot as fbOnSnapshot, 
  query as fbQuery, 
  addDoc as fbAddDoc, 
  updateDoc as fbUpdateDoc, 
  deleteDoc as fbDeleteDoc, 
  doc as fbDoc, 
  setDoc as fbSetDoc, getDoc as fbGetDoc 
} from "firebase/firestore";

import firebaseAppletConfig from "../../firebase-applet-config.json";

// إعدادات مشروع mcci-cm الجديد والصحيح من البيئة، مع توفير خيارات بديلة
const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyBbLUxGy1mosbv015JiZTSqpOwQP0CdVRU",
  authDomain: firebaseAppletConfig.authDomain || "mcci-cm-126e4.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "mcci-cm",
  storageBucket: firebaseAppletConfig.storageBucket || "mcci-cm.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "850283799531",
  appId: firebaseAppletConfig.appId || "1:850283799531:web:d11fc33f4f27f25d586fae",
  measurementId: firebaseAppletConfig.measurementId || "G-MW58ZJ4KPK"
};

let app: any = null;
let db: any = null;
let auth: any = null;

try {
  app = fbInitializeApp(firebaseConfig);
} catch (e) {
  console.warn("Firebase initializeApp failed", e);
}

try {
  db = fbInitializeFirestore(app, { experimentalForceLongPolling: true }, (firebaseAppletConfig as any).firestoreDatabaseId || "ai-studio-a65022e1-61ad-4fbc-9420-555fa8c23675");
  if (db) {
    // Enable Offline Mode
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
        } else if (err.code === 'unimplemented') {
            console.warn("The current browser does not support all of the features required to enable persistence");
        }
    });
  }
} catch (e) {
  console.warn("Firebase getFirestore failed", e);
}

try {
  auth = fbGetAuth(app);
} catch (e) {
  console.warn("Firebase getAuth failed", e);
}

export function collection(dbRef: any, collectionName: string): any {
  return fbCollection(dbRef, collectionName);

}

export function doc(dbRef: any, nameOrPath: string, maybeId?: string): any {
  return maybeId ? fbDoc(dbRef, nameOrPath, maybeId) : fbDoc(dbRef, nameOrPath);

}

export function query(collectionRef: any, ...queryConstraints: any[]): any {
  return fbQuery(collectionRef, ...queryConstraints);

}

export async function addDoc(collectionRef: any, data: any): Promise<any> {
  return fbAddDoc(collectionRef, data);

}

export async function setDoc(docRef: any, data: any, options?: any): Promise<any> {
  return options !== undefined ? fbSetDoc(docRef, data, options) : fbSetDoc(docRef, data);

}

export async function updateDoc(docRef: any, data: any): Promise<any> {
  return fbUpdateDoc(docRef, data);

}

export async function deleteDoc(docRef: any): Promise<any> {
  return fbDeleteDoc(docRef);

}

export function onSnapshot(queryOrColRef: any, onNext: (snap: any) => void, onError?: (err: any) => void): any {
  const safeOnError = onError || ((err: any) => {
    console.warn("Firestore snapshot listener error:", err);
  });
  return fbOnSnapshot(queryOrColRef, onNext, safeOnError);

}

export { app, db, auth };
export default app;
export async function getDoc(docRef: any): Promise<any> {
  return fbGetDoc(docRef);
}
export { where } from "firebase/firestore";
import { getCountFromServer as fbGetCountFromServer } from "firebase/firestore";

export async function getCountFromServer(queryOrColRef: any): Promise<any> {
  return fbGetCountFromServer(queryOrColRef);
}

import { getDocs as fbGetDocs } from "firebase/firestore";

const safeEmptySnapshot = {
  docs: [],
  forEach: (cb: any) => {},
  empty: true,
  size: 0,
  docChanges: () => []
};

export async function getDocs(queryOrColRef: any): Promise<any> {
  return fbGetDocs(queryOrColRef);

}
