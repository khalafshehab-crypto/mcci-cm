// src/lib/firebaseUtils.ts
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc
} from './firebase';
import { db, auth } from './firebase';

export const logSystemAction = (collectionName: string, operation: string, id: string) => {
    if (collectionName === 'system_logs') return; 
    
    try {
        let employeeName = "مدير النظام";
        const stored = localStorage.getItem("current_user");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.name) employeeName = parsed.name;
        }

        let opText = "";
        if (operation === 'CREATE') opText = "إضافة";
        else if (operation === 'UPDATE') opText = "تعديل";
        else if (operation === 'DELETE') opText = "حذف";

        let moduleText = collectionName;
        if (collectionName === "recommendations") moduleText = "توصية";
        else if (collectionName === "tasks") moduleText = "مهمة";
        else if (collectionName === "events") moduleText = "فعالية";
        else if (collectionName === "committees") moduleText = "لجنة";
        else if (collectionName === "members") moduleText = "عضو";

        const logEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
            time: new Date().toLocaleString('ar-SA'),
            employeeName,
            operationType: opText,
            details: `قام الموظف بإجراء عملية ${opText} على السجل (${moduleText}) - معرف ${id ? String(id).substring(0,8) : 'غير معروف'}`
        };

        if (db) {
            addDoc(collection(db, "system_logs"), logEntry).catch(()=> {});
        }
    } catch (e) {}
};

export function useFirestoreCollection<T>(collectionName: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as T[];
      setData(docs);
      setLoading(false);
    }, (error: any) => {
      console.warn(`Firestore subscription failed for '${collectionName}'.`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  const addDocument = async (item: Omit<T, 'id'>) => {
    logSystemAction(collectionName, "CREATE", "");
    try {
      const docRef = await addDoc(collection(db, collectionName), item);
      return docRef.id;
    } catch(e) {
      console.error("Firestore CREATE error:", e);
      return null;
    }
  };

  const updateDocument = async (id: string, item: Partial<T>) => {
    logSystemAction(collectionName, "UPDATE", id);
    try {
      await setDoc(doc(db, collectionName, String(id)), item, { merge: true });
    } catch(e) {
      console.error("Firestore UPDATE error:", e);
    }
  };

  const deleteDocument = async (id: string) => {
    logSystemAction(collectionName, "DELETE", id);
    try {
      await deleteDoc(doc(db, collectionName, String(id)));
    } catch(e) {
      console.error("Firestore DELETE error:", e);
    }
  };

  const setDocument = async (id: string, item: Omit<T, 'id'>) => {
    logSystemAction(collectionName, "UPDATE", id);
    try {
      await setDoc(doc(db, collectionName, String(id)), item);
    } catch(e) {
      console.error("Firestore WRITE error:", e);
    }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument, setDocument };
}

export const sendSystemAlert = async (targetUser: string, title: string, message: string, type: string = "alert", link: string = "#") => {
  try {
    await addDoc(collection(db, "system_alerts"), {
      targetUser,
      title,
      message,
      type,
      link,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to send system alert", err);
  }
};
