import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

getSharedAccessToken_func = r'''export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  if (tokenPromise) return tokenPromise;
  
  tokenPromise = (async () => {
    try {
      const docRef = doc(db, "system_settings", "google_workspace");
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().access_token) {
        return snap.data().access_token;
      }
    } catch (e) {
      console.warn("Failed to get shared access token:", e);
    }
    return null;
  })();
  
  const token = await tokenPromise;
  tokenPromise = null;
  return token;
}'''

new_getSharedAccessToken_func = r'''export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  // As a fallback, check localStorage directly in case memory was cleared
  const local = localStorage.getItem("google_access_token");
  if (local) {
     cachedAccessToken = local;
     return local;
  }
  
  if (tokenPromise) return tokenPromise;
  
  tokenPromise = (async () => {
    try {
      const docRef = doc(db, "system_settings", "google_workspace");
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().access_token) {
        return snap.data().access_token;
      }
    } catch (e) {
      console.warn("Failed to get shared access token:", e);
    }
    return null;
  })();
  
  const token = await tokenPromise;
  tokenPromise = null;
  return token;
}'''

content = content.replace(getSharedAccessToken_func, new_getSharedAccessToken_func)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
