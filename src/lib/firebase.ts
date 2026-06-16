// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// إعدادات Firebase المعتمدة للمشروع الجديد mcci-cm
const firebaseConfig = {
  apiKey: "AIzaSyBbLUxGy1mosbv015JiZTSqpOwQP0CdVRU",
  authDomain: "mcci-cm-126e4.firebaseapp.com",
  projectId: "mcci-cm",
  storageBucket: "mcci-cm.firebasestorage.app",
  messagingSenderId: "850283799531",
  appId: "1:850283799531:web:d11fc33f4f27f25d586fae",
  measurementId: "G-MW58ZJ4KPK"
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// تصدير خدمات قاعدة البيانات والتحقق من الهوية لتشغيل النظام الفعلي
export const db = getFirestore(app);
export const auth = getAuth(app);

// تهيئة إحصائيات جوجل (Analytics) بشكل آمن لبيئة الويب ومتصفحات الـ iframe
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics could not be initialized in this window/iframe environment:", err);
  });
}
