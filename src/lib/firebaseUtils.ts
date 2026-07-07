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
    const safetyTimeout = setTimeout(() => {
      if (active && !hasLoaded) {
        console.warn(`Firestore subscription loading timed out for '${collectionName}'. Setting blocked state.`);
        if (auth?.currentUser) {
          setFirestoreBlocked(true);
        } else {
          setupLocalFallback();
        }
      }
    }, 8000);

    // Listen to changes in the Firestore blocked state
    const unsubscribeBlocked = subscribeToFirestoreBlocked((blocked) => {
      if (!active) return;

      if (blocked) {
        // If Firestore is blocked, cleanly unsubscribe from real-time Firestore updates immediately
        if (unsubscribe) {
          try {
            unsubscribe();
          } catch(e) {}
          unsubscribe = null;
        }
        // Start the offline mock local storage fallback if not already active
        if (!localCleanup) {
          setupLocalFallback();
        }
      } else {
        // If not blocked, establish the real-time Firestore listener
        if (!unsubscribe) {
          // If we had a local fallback running, clean it up before switching back to Firestore
          if (localCleanup) {
            try {
              localCleanup();
            } catch(e) {}
            localCleanup = null;
          }
          
          try {
            if (!db || db.type === "dummy_firestore") {
              setFirestoreBlocked(true);
              return;
            }
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
              
              // Only set global blocked state if this is not an expected unauthenticated permission error
              const isUnauthPermissionError = error?.code === 'permission-denied' && !auth?.currentUser;
              if (!isUnauthPermissionError) {
                setFirestoreBlocked(true);
              } else {
                if (unsubscribe) {
                  try { unsubscribe(); } catch(e) {}
                  unsubscribe = null;
                }
                setupLocalFallback();
              }
            });
          } catch (e) {
            if (!active) return;
            console.warn(`Firestore collection setup failed for '${collectionName}'. Gracefully falling back to local storage.`, e);
            setFirestoreBlocked(true);
          }
        }
      }
    });

    const unsubscribeAuth = auth?.onAuthStateChanged?.((user) => {
      if (!active) return;
      if (user && localCleanup) {
        // User logged in and we are in local fallback. Force a retry of Firestore connection.
        // We do this by triggering the blocked listeners with false.
        setFirestoreBlocked(false);
      }
    });

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
      clearTimeout(safetyTimeout);
      unsubscribeBlocked();
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch(e) {}
      }
      if (localCleanup) {
        try {
          localCleanup();
        } catch(e) {}
      }
    };
  }, [collectionName]);

  const addDocument = async (item: Omit<T, 'id'>) => {
    const list = getLocalCollection(collectionName);
    const newId = `${collectionName.substring(0, 4)}_${Math.random().toString(36).substring(2, 11)}`;
    const localItem = { ...item, id: newId } as unknown as T;
    list.push(localItem);
    saveLocalCollection(collectionName, list);

    if (!isUseMock()) {
      try {
        const docRef = await withTimeout(
          addDoc(collection(db, collectionName), item),
          8000,
          null
        );
        
        if (docRef) {
          // Sync the local storage collection's fallback ID with the actual Firestore ID
          const freshList = getLocalCollection(collectionName);
          const index = freshList.findIndex(x => String(x.id) === String(newId));
          if (index >= 0) {
            freshList[index].id = docRef.id;
            saveLocalCollection(collectionName, freshList);
          }
          return docRef.id;
        }
      } catch(e) {
        handleFirestoreError(e, OperationType.CREATE, collectionName);
        return newId;
      }
    }
    return newId;
  };

  const updateDocument = async (id: string, item: Partial<T>) => {
    const list = getLocalCollection(collectionName);
    const index = list.findIndex(x => String(x.id) === String(id));
    if (index >= 0) {
      list[index] = { ...list[index], ...item };
    } else {
      list.push({ id, ...item } as any);
    }
    saveLocalCollection(collectionName, list);

    if (!isUseMock()) {
      try {
        await withTimeout(
          setDoc(doc(db, collectionName, String(id)), item, { merge: true }),
          8000,
          null
        );
      } catch(e) {
        handleFirestoreError(e, OperationType.UPDATE, `${collectionName}/${id}`);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    const list = getLocalCollection(collectionName);
    const filtered = list.filter(item => String(item.id) !== String(id));
    saveLocalCollection(collectionName, filtered);

    if (!isUseMock()) {
      try {
        await withTimeout(
          deleteDoc(doc(db, collectionName, String(id))),
          8000,
          null
        );
      } catch(e) {
        handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${id}`);
      }
    }
  };

  const setDocument = async (id: string, item: Omit<T, 'id'>) => {
    const list = getLocalCollection(collectionName);
    const index = list.findIndex(x => String(x.id) === String(id));
    if (index >= 0) {
      list[index] = { ...item, id } as any;
    } else {
      list.push({ ...item, id } as any);
    }
    saveLocalCollection(collectionName, list);

    if (!isUseMock()) {
      try {
        await withTimeout(
          setDoc(doc(db, collectionName, String(id)), item),
          8000,
          null
        );
      } catch(e) {
        handleFirestoreError(e, OperationType.WRITE, `${collectionName}/${id}`);
      }
    }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument, setDocument };
}

export { setFirestoreBlocked, subscribeToFirestoreBlocked, isUseMock };
