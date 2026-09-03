// src/lib/firebaseUtils.ts
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  setFirestoreBlocked,
  subscribeToFirestoreBlocked,
  isUseMock
} from './firebase';
import { db, auth } from './firebase';
import { getLocalCollection, saveLocalCollection } from './mockFirebase';


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

        const logs = JSON.parse(localStorage.getItem('mock_db_system_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('mock_db_system_logs', JSON.stringify(logs));
        window.dispatchEvent(new StorageEvent('storage', { key: 'mock_db_system_logs', newValue: JSON.stringify(logs) }));

        if (!isUseMock()) {
            addDoc(collection(db, "system_logs"), logEntry).catch(()=> {});
        }
    } catch (e) {}
};
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Block state managed globally via firebase.ts

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Warning (non-fatal, falling back to localStorage): ', JSON.stringify(errInfo));
  
  const isPermissionDenied = String(error).toLowerCase().includes('permission') || (error as any)?.code === 'permission-denied';
  if (!(isPermissionDenied && !auth?.currentUser)) {
    setFirestoreBlocked(true);
  }
}

// Wrap any Firestore Promise with a timeout to prevent hanging infinitely on security rules or connections
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, defaultValue: T): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Firestore task timed out after ${timeoutMs}ms. Forcing fallback mode.`);
      setFirestoreBlocked(true);
      resolve(defaultValue);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
}

export function useFirestoreCollection<T>(collectionName: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let localCleanup: (() => void) | null = null;
    let active = true;
    let hasLoaded = false;

    // Safety timeout: if we don't receive data within 8000ms, assume Firestore is blocked/slow and fallback
    

    function setupFirestoreListener() {
      if (localCleanup) {
        try { localCleanup(); } catch(e) {}
        localCleanup = null;
      }
      if (unsubscribe) return;
      try {
        
        const q = query(collection(db, collectionName));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (!active) return;
          hasLoaded = true;
          const docs = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as T[];
          
          setData(docs);
          setLoading(false);
        }, (error: any) => {
          if (!active) return;
          console.warn(`Firestore subscription failed for '${collectionName}'. Gracefully falling back to local storage.`, error);
          
          const isUnauthPermissionError = error?.code === 'permission-denied';
          if (!isUnauthPermissionError) {
            setFirestoreBlocked(true);
          } else {
            if (unsubscribe) {
              try { unsubscribe(); } catch(e) {}
              unsubscribe = null;
            }
          }
        });
      } catch (e) {
        if (!active) return;
        console.warn(`Firestore collection setup failed for '${collectionName}'. Gracefully falling back to local storage.`, e);
        setFirestoreBlocked(true);
      }
    }

    // Listen to changes in the Firestore blocked state
    

    const unsubscribeAuth = auth?.onAuthStateChanged?.((user) => {
      if (!active) return;
      if (user) {
        // User logged in and we are in local fallback (likely due to unauthenticated permission error).
        // Force a retry of Firestore connection directly.
        setupFirestoreListener();
      }
    });

    

    return () => {
      active = false;
      
      
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribe) {
        try { unsubscribe(); } catch(e) {}
      }
      if (localCleanup) {
        try { localCleanup(); } catch(e) {}
      }
    };
  }, [collectionName]);

  const addDocument = async (item: Omit<T, 'id'>) => {
    const newId = `${collectionName.substring(0, 4)}_${Math.random().toString(36).substring(2, 11)}`;
    logSystemAction(collectionName, "CREATE", newId);

          try {
        const docRef = await addDoc(collection(db, collectionName), item);
        return docRef.id;
      } catch(e) {
        console.error("Firestore CREATE error:", e);
      }
    return newId;
  };

  const updateDocument = async (id: string, item: Partial<T>) => {
    

          try {
        await setDoc(doc(db, collectionName, String(id)), item, { merge: true });
      } catch(e) {
        console.error("Firestore UPDATE error:", e);
      }
  };

  const deleteDocument = async (id: string) => {
    

          try {
        await deleteDoc(doc(db, collectionName, String(id)));
      } catch(e) {
        console.error("Firestore DELETE error:", e);
      }
  };

  const setDocument = async (id: string, item: Omit<T, 'id'>) => {
    

          try {
        await setDoc(doc(db, collectionName, String(id)), item);
      } catch(e) {
        console.error("Firestore WRITE error:", e);
      }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument, setDocument };
}

export { setFirestoreBlocked, subscribeToFirestoreBlocked, isUseMock };
