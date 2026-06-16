import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// إعدادات مشروع mcci-cm الجديد والصحيح
const firebaseConfig = {
  apiKey: "AIzaSyBbLUxGy1mosbv015JiZTSqpOwQP0CdVRU",
  authDomain: "mcci-cm-126e4.firebaseapp.com",
  projectId: "mcci-cm",
  storageBucket: "mcci-cm.firebasestorage.app",
  messagingSenderId: "850283799531",
  appId: "1:850283799531:web:d11fc33f4f27f25d586fae",
  measurementId: "G-MW58ZJ4KPK"
};

// تهيئة الفايربيس
const app = initializeApp(firebaseConfig);

// تصدير الخدمات لتستخدمها لوحة التحكم (قاعدة البيانات والدخول بجوجل)
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;