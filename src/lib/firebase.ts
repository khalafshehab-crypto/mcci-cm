import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// إعدادات مشروع Firebase الخاص بك
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy...",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mcci-cm-126e4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mcci-cm-126e4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mcci-cm-126e4.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1028328602621",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1028328602621:web:...",
};

// تهيئة تطبيق Firebase لمرة واحدة فقط
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// تهيئة الخدمات
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// تهيئة موفر تسجيل الدخول عبر Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
