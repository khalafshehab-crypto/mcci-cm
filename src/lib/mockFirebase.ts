// src/lib/mockFirebase.ts

// Global in-memory list of active reactive query subscriptions
const listeners: { [collectionName: string]: Array<(snapshot: any) => void> } = {};

// حذف الذاكرة المؤقتة للمتصفح نهائياً
if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
  const FORCE_RESET_KEY = "force_clean_slate_final_v10";
  if (!localStorage.getItem(FORCE_RESET_KEY)) {
    localStorage.removeItem("mock_db_committees");
    localStorage.removeItem("mock_db_members");
    localStorage.removeItem("mock_db_recommendations");
    localStorage.removeItem("mock_db_events");
    localStorage.removeItem("mock_db_tasks");
    localStorage.removeItem("mock_db_employees");
    localStorage.removeItem("mock_db_system_logs");
    localStorage.removeItem("mock_db_kpis");
    localStorage.removeItem("mock_db_reports");
    localStorage.removeItem("mock_db_join_requests");
    localStorage.removeItem("mock_db_approved_emails");
    localStorage.removeItem("mock_db_templates");
    localStorage.removeItem("current_user"); 
    localStorage.setItem(FORCE_RESET_KEY, "true");
  }
}

// Helper to load collection from localStorage with institutional fallback seeds
export function getLocalCollection(collectionName: string): any[] {
  const dataStr = localStorage.getItem(`mock_db_${collectionName}`);
  if (!dataStr) {
    return getSeedData(collectionName);
  }
  try {
    return JSON.parse(dataStr);
  } catch (e) {
    return getSeedData(collectionName);
  }
}

// Helper to save collection to localStorage and notify all subscribers
export function saveLocalCollection(collectionName: string, data: any[]) {
  try {
    localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(data));
  } catch (err: any) {
    console.error(`🔴 LocalStorage save failed for ${collectionName}:`, err);
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      try {
        if (collectionName === "employees") {
          const stripped = data.map(emp => {
            if (emp.photo && emp.photo.length > 50000) {
              return { ...emp, photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" };
            }
            return emp;
          });
          localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(stripped));
        } else {
          localStorage.removeItem("mock_db_system_logs");
          localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(data));
        }
      } catch (innerErr) {
        console.error("🔴 Fatal: Failed to recover from QuotaExceededError in LocalStorage:", innerErr);
      }
    }
  }
  const collectionListeners = listeners[collectionName] || [];
  collectionListeners.forEach(listener => {
    try {
      listener(makeSnapshot(data));
    } catch (e) {
      console.error("Error triggering mock listener for " + collectionName, e);
    }
  });
}

// Helper query mapper
function makeSnapshot(data: any[]) {
  return {
    docs: data.map(item => ({
      id: item.id || '',
      data: () => item
    }))
  };
}

// Seed data generators - تم حذف الجداول وتثبيت حساب مشرف النظام الرئيسي فقط ببيانات نظيفة
function getSeedData(collectionName: string): any[] {
  let defaultData: any[] = [];
  if (collectionName === "employees") {
    defaultData = [
      {
        id: "01",
        name: "مدير النظام",
        role: "SYS_ADMIN",
        roleAr: "مدير النظام",
        jobTitle: "مدير النظام",
        phone: "+966558494158",
        email: "khalafshehab@gmail.com",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
        committees: [],
        active: true,
        joinDate: "2024/01/15"
      }
    ];
  } else if (collectionName === "committees") {
    defaultData = [];
  } else if (collectionName === "members") {
    defaultData = [];
  } else if (collectionName === "events") {
    defaultData = [];
  } else if (collectionName === "recommendations") {
    defaultData = [];
  } else if (collectionName === "tasks") {
    defaultData = [];
  } else if (collectionName === "system_logs") {
    defaultData = [];
  } else if (collectionName === "templates") {
    defaultData = [];
  } else if (collectionName === "reports") {
    defaultData = [];
  } else if (collectionName === "kpis") {
    defaultData = [];
  } else if (collectionName === "join_requests") {
    defaultData = [];
  } else if (collectionName === "approved_emails") {
    defaultData = [];
  }

  localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(defaultData));
  return defaultData;
}

// Full offline local session manager for Authentication
export const auth: any = {
  get currentUser() {
    try {
      const u = localStorage.getItem("current_user");
      if (u) {
        const parsed = JSON.parse(u);
        return {
          uid: parsed.id || '01',
          email: parsed.email,
          displayName: parsed.name,
          emailVerified: true,
          photoURL: parsed.photo,
          providerData: []
        };
      }
    } catch(e) {}
    return null;
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    const checkAuth = () => {
      try {
        const u = localStorage.getItem("current_user");
        if (u) {
          const parsed = JSON.parse(u);
          callback({
            uid: parsed.id || '01',
            email: parsed.email,
            displayName: parsed.name,
            emailVerified: true,
            photoURL: parsed.photo,
            providerData: []
          });
        } else {
          callback(null);
        }
      } catch(e) {
        callback(null);
      }
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }
};

export const db: any = {
  type: "mock_firestore",
  app: {},
  toJSON: () => ({})
};

// Official API compliance structure
export function initializeApp(): any { return {}; }
export function getAuth(): any { return auth; }
export function getFirestore(): any { return db; }

export function collection(dbRef: any, collectionName: string): any {
  return { 
    type: 'collection', 
    name: collectionName,
    id: collectionName,
    path: collectionName,
    parent: null,
    withConverter: () => ({})
  };
}

export function doc(dbRef: any, nameOrPath: string, maybeId?: string): any {
  let colName = "";
  let id = "";
  if (maybeId) {
    colName = nameOrPath;
    id = String(maybeId);
  } else {
    const parts = nameOrPath.split('/');
    colName = parts[0];
    id = parts[1] || '';
  }
  return { 
    type: 'doc', 
    collectionName: colName, 
    id, 
    path: `${colName}/${id}`,
    firestore: db,
    converter: null
  };
}

export function query(collectionRef: any): any {
  return { type: 'query', collectionRef, name: collectionRef.name };
}

export async function addDoc(collectionRef: any, data: any): Promise<any> {
  const colName = collectionRef.name;
  const list = getLocalCollection(colName);
  const newId = `${colName.substring(0, 4)}_${Math.random().toString(36).substring(2, 11)}`;
  const item = { id: newId, ...data };
  list.push(item);
  saveLocalCollection(colName, list);
  return { id: newId, path: `${colName}/${newId}` };
}

export async function setDoc(docRef: any, data: any, options: any = {}): Promise<any> {
  const colName = docRef.collectionName;
  const list = getLocalCollection(colName);
  const targetId = String(docRef.id);
  const index = list.findIndex(item => String(item.id) === targetId);
  if (index >= 0) {
    if (options.merge) {
      list[index] = { ...list[index], ...data };
    } else {
      list[index] = { id: targetId, ...data };
    }
  } else {
    list.push({ id: targetId, ...data });
  }
  saveLocalCollection(colName, list);
}

export async function updateDoc(docRef: any, data: any): Promise<any> {
  return setDoc(docRef, data, { merge: true });
}

export async function deleteDoc(docRef: any): Promise<any> {
  const colName = docRef.collectionName;
  const list = getLocalCollection(colName);
  const targetId = String(docRef.id);
  const filtered = list.filter(item => String(item.id) !== targetId);
  saveLocalCollection(colName, filtered);
}

export function onSnapshot(queryOrColRef: any, onNext: (snap: any) => void, onError?: (err: any) => void): any {
  const colName = queryOrColRef.type === 'query' 
    ? queryOrColRef.collectionRef.name 
    : queryOrColRef.name;

  if (!listeners[colName]) {
    listeners[colName] = [];
  }
  listeners[colName].push(onNext);

  const currentData = getLocalCollection(colName);
  onNext(makeSnapshot(currentData));

  return () => {
    listeners[colName] = (listeners[colName] || []).filter(l => l !== onNext);
  };
}