const fs = require('fs');

const file = '/app/applet/src/lib/googleApi.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace getSharedAccessToken logic
const oldGetShared = `export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  if (tokenPromise) return tokenPromise;
  
  tokenPromise = (async () => {
    try {
      if (auth.currentUser?.email) {
         try {
           const myRef = doc(db, "employee_tokens", auth.currentUser.email.toLowerCase());
           const mySnap = await getDoc(myRef);
           if (mySnap.exists()) {
             const data = mySnap.data();
             if (data && data.token) {
               setCachedAccessToken(data.token);
               return data.token;
             }
           }
         } catch(e) {}
      }

      const docRef = doc(db, "system_settings", "google_workspace");
      const snap = await getDoc(docRef);
      if (snap && snap.exists && snap.exists()) {
        const data = snap.data();
        if (data && data.token) {
           setCachedAccessToken(data.token);
           try {
             localStorage.setItem("google_access_token", data.token);
           } catch(e) {}
           return data.token;
        }
      }
    } catch(e) {
      console.warn("Failed to get shared token", e);
    }
    return null;
  })();
  
  const res = await tokenPromise;
  tokenPromise = null;
  return res;
}`;

const newGetShared = `export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  if (tokenPromise) return tokenPromise;
  
  tokenPromise = (async () => {
    try {
      if (auth.currentUser?.email) {
         try {
           const myRef = doc(db, "employee_tokens", auth.currentUser.email.toLowerCase());
           const mySnap = await getDoc(myRef);
           if (mySnap.exists()) {
             const data = mySnap.data();
             if (data && data.token) {
               setCachedAccessToken(data.token);
               return data.token;
             }
           }
         } catch(e) {}
      }
      
      // Fallback to local storage as a last resort for the current user
      const localToken = localStorage.getItem("google_access_token");
      if (localToken) {
        setCachedAccessToken(localToken);
        return localToken;
      }
      
    } catch(e) {
      console.warn("Failed to get personal token", e);
    }
    return null;
  })();
  
  const res = await tokenPromise;
  tokenPromise = null;
  return res;
}`;

content = content.replace(oldGetShared, newGetShared);

fs.writeFileSync(file, content);
console.log('Updated getSharedAccessToken in googleApi.ts');
