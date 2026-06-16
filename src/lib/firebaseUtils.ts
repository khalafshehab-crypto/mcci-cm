// src/lib/firebaseUtils.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { getLocalCollection, saveLocalCollection } from './mockFirebase';

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

// Global flag to track whether active Firestore is blocked (insufficient permissions, etc.)
let isFirestoreBlocked = false;
const blockedListeners = new Set<(blocked: boolean) => void>();

export function setFirestoreBlocked(blocked: boolean) {
  if (isFirestoreBlocked !== blocked) {
    isFirestoreBlocked = blocked;
    blockedListeners.forEach(listener => {
      try {
        listener(blocked);
      } catch (e) {
        console.error("Error invoking Firestore block listener:", e);
      }
    });
  }
}

export function subscribeToFirestoreBlocked(listener: (blocked: boolean) => void) {
  blockedListeners.add(listener);
  listener(isFirestoreBlocked);
  return () => {
    blockedListeners.delete(listener);
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Warning (non-fatal, falling back to localStorage): ', JSON.stringify(errInfo));
  setFirestoreBlocked(true);
}

export function useFirestoreCollection<T>(collectionName: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let localCleanup: (() => void) | null = null;
    let active = true;

    try {
      const q = query(collection(db, collectionName));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!active) return;
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(docs);
        setLoading(false);
      }, (error) => {
        if (!active) return;
        console.warn(`Firestore subscription failed for '${collectionName}'. Gracefully falling back to local storage.`, error);
        setFirestoreBlocked(true);
        setupLocalFallback();
      });
    } catch (e) {
      if (!active) return;
      console.warn(`Firestore collection setup failed for '${collectionName}'. Gracefully falling back to local storage.`, e);
      setFirestoreBlocked(true);
      setupLocalFallback();
    }

    function setupLocalFallback() {
      // Load initial local data
      const localData = getLocalCollection(collectionName) as T[];
      setData(localData);
      setLoading(false);

      // Listen to storage changes for reactive updates across components/tabs
      const handleStorageUpdate = (e: StorageEvent) => {
        if (!active) return;
        if (e.key === `mock_db_${collectionName}`) {
          try {
            const updated = JSON.parse(e.newValue || "[]") as T[];
            setData(updated);
          } catch (err) {}
        }
      };
      
      window.addEventListener('storage', handleStorageUpdate);

      // Simple periodic polling to synchronize changes within the same tab in real-time
      const intervalId = setInterval(() => {
        if (!active) return;
        const fresh = getLocalCollection(collectionName) as T[];
        setData(fresh);
      }, 1000);

      localCleanup = () => {
        window.removeEventListener('storage', handleStorageUpdate);
        clearInterval(intervalId);
      };
    }

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
      if (localCleanup) localCleanup();
    };
  }, [collectionName]);

  const addDocument = async (item: Omit<T, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), item);
      return docRef.id;
    } catch(e) {
      console.warn(`Firestore addDoc failed for ${collectionName}, saving into localStorage fallback.`, e);
      setFirestoreBlocked(true);
      const list = getLocalCollection(collectionName);
      const newId = `${collectionName.substring(0, 4)}_${Math.random().toString(36).substring(2, 11)}`;
      const localItem = { id: newId, ...item };
      list.push(localItem);
      saveLocalCollection(collectionName, list);
      return newId;
    }
  };

  const updateDocument = async (id: string, item: Partial<T>) => {
    try {
      await setDoc(doc(db, collectionName, String(id)), item, { merge: true });
    } catch(e) {
      console.warn(`Firestore updateDoc failed for ${collectionName}/${id}, saving into localStorage fallback.`, e);
      setFirestoreBlocked(true);
      const list = getLocalCollection(collectionName);
      const index = list.findIndex(x => String(x.id) === String(id));
      if (index >= 0) {
        list[index] = { ...list[index], ...item };
        saveLocalCollection(collectionName, list);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, String(id)));
    } catch(e) {
      console.warn(`Firestore deleteDoc failed for ${collectionName}/${id}, saving into localStorage fallback.`, e);
      setFirestoreBlocked(true);
      const list = getLocalCollection(collectionName);
      const filtered = list.filter(item => String(item.id) !== String(id));
      saveLocalCollection(collectionName, filtered);
    }
  };

  const setDocument = async (id: string, item: Omit<T, 'id'>) => {
     try {
       await setDoc(doc(db, collectionName, String(id)), item);
     } catch(e) {
       console.warn(`Firestore setDoc failed for ${collectionName}/${id}, saving into localStorage fallback.`, e);
       setFirestoreBlocked(true);
       const list = getLocalCollection(collectionName);
       const index = list.findIndex(x => String(x.id) === String(id));
       if (index >= 0) {
         list[index] = { id, ...item };
       } else {
         list.push({ id, ...item });
       }
       saveLocalCollection(collectionName, list);
     }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument, setDocument };
}
