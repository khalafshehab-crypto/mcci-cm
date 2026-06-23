import { initializeApp as fbInitializeApp } from "firebase/app";
import { getAuth as fbGetAuth } from "firebase/auth";
import { 
  getFirestore as fbGetFirestore,
  collection as fbCollection, 
  onSnapshot as fbOnSnapshot, 
  query as fbQuery, 
  addDoc as fbAddDoc, 
  updateDoc as fbUpdateDoc, 
  deleteDoc as fbDeleteDoc, 
  doc as fbDoc, 
  setDoc as fbSetDoc 
} from "firebase/firestore";
import * as mockFb from "./mockFirebase";
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
  console.warn("Firebase initializeApp failed, using empty configuration representation.", e);
  app = {};
}

try {
  db = fbGetFirestore(app);
  if (db) {
    db.isBlocked = !db || db.type === "dummy_firestore";
  }
} catch (e) {
  console.warn("Firebase getFirestore failed, using mock database implementation.", e);
  db = {
    type: "dummy_firestore",
    app: app,
    isBlocked: true,
    disableNetwork: async () => {},
    enableNetwork: async () => {},
  };
}

try {
  auth = fbGetAuth(app);
} catch (e) {
  console.warn("Firebase getAuth failed, using mock authentication representation.", e);
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signOut: async () => {},
  };
}

export function isUseMock() {
  return !db || db.type === "dummy_firestore" || db.isBlocked === true;
}

export function collection(dbRef: any, collectionName: string): any {
  if (isUseMock()) {
    return mockFb.collection(dbRef, collectionName);
  }
  try {
    return fbCollection(dbRef, collectionName);
  } catch (e) {
    console.warn("Collection fallback on crash", e);
    return mockFb.collection(dbRef, collectionName);
  }
}

export function doc(dbRef: any, nameOrPath: string, maybeId?: string): any {
  if (isUseMock()) {
    return mockFb.doc(dbRef, nameOrPath, maybeId);
  }
  try {
    return maybeId ? fbDoc(dbRef, nameOrPath, maybeId) : fbDoc(dbRef, nameOrPath);
  } catch (e) {
    console.warn("Doc fallback on crash", e);
    return mockFb.doc(dbRef, nameOrPath, maybeId);
  }
}

export function query(collectionRef: any, ...queryConstraints: any[]): any {
  if (isUseMock()) {
    return mockFb.query(collectionRef);
  }
  try {
    return fbQuery(collectionRef, ...queryConstraints);
  } catch (e) {
    console.warn("Query fallback on crash", e);
    return mockFb.query(collectionRef);
  }
}

export async function addDoc(collectionRef: any, data: any): Promise<any> {
  if (isUseMock()) {
    return mockFb.addDoc(collectionRef, data);
  }
  try {
    return await fbAddDoc(collectionRef, data);
  } catch (e) {
    console.warn("addDoc fallback on crash", e);
    return mockFb.addDoc(collectionRef, data);
  }
}

export async function setDoc(docRef: any, data: any, options?: any): Promise<any> {
  if (isUseMock()) {
    return mockFb.setDoc(docRef, data, options);
  }
  try {
    return await fbSetDoc(docRef, data, options);
  } catch (e) {
    console.warn("setDoc fallback on crash", e);
    return mockFb.setDoc(docRef, data, options);
  }
}

export async function updateDoc(docRef: any, data: any): Promise<any> {
  if (isUseMock()) {
    return mockFb.updateDoc(docRef, data);
  }
  try {
    return await fbUpdateDoc(docRef, data);
  } catch (e) {
    console.warn("updateDoc fallback on crash", e);
    return mockFb.updateDoc(docRef, data);
  }
}

export async function deleteDoc(docRef: any): Promise<any> {
  if (isUseMock()) {
    return mockFb.deleteDoc(docRef);
  }
  try {
    return await fbDeleteDoc(docRef);
  } catch (e) {
    console.warn("deleteDoc fallback on crash", e);
    return mockFb.deleteDoc(docRef);
  }
}

export function onSnapshot(queryOrColRef: any, onNext: (snap: any) => void, onError?: (err: any) => void): any {
  if (isUseMock()) {
    return mockFb.onSnapshot(queryOrColRef, onNext, onError);
  }
  try {
    return fbOnSnapshot(queryOrColRef, onNext, onError);
  } catch (e) {
    console.warn("onSnapshot fallback on crash", e);
    return mockFb.onSnapshot(queryOrColRef, onNext, onError);
  }
}

export { app, db, auth };
export default app;