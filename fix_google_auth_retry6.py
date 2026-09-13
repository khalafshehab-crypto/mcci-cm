import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure that `customToken` is used for authentication failure logging, 
# BUT `getSharedAccessToken` fetches `localStorage.getItem("google_access_token")`.
# Wait, let's look at `getSharedAccessToken()`

get_shared = r'''export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) return cachedAccessToken;
  
  if (typeof window !== "undefined") {
     const local = localStorage.getItem("google_access_token");
     if (local) {
        cachedAccessToken = local;
        return local;
     }
  }

  // Fallback to shared system connection for viewing files without user login
  try {
    const docRef = doc(db, "system_settings", "google_workspace");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      cachedAccessToken = snap.data().token;
      return cachedAccessToken;
    }
  } catch(e) {}
  
  return null;
}'''

new_get_shared = r'''export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) return cachedAccessToken;
  
  if (typeof window !== "undefined") {
     const local = localStorage.getItem("google_access_token");
     if (local) {
        cachedAccessToken = local;
        return local;
     }
  }

  // Fallback to shared system connection for viewing files without user login
  try {
    const docRef = doc(db, "system_settings", "google_workspace");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      cachedAccessToken = snap.data().token;
      return cachedAccessToken;
    }
  } catch(e) {}
  
  return null;
}'''

