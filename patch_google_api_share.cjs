const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

// Update imports
if (!content.includes('getDoc')) {
    content = content.replace(
        'import { auth } from "./firebase";',
        'import { auth, db, doc, setDoc, getDoc } from "./firebase";'
    );
}

// Update getCachedAccessToken to be async and fetch from db if empty or valid
const newGetCachedAccessToken = `
let tokenPromise: Promise<string | null> | null = null;
export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  if (tokenPromise) return tokenPromise;
  
  tokenPromise = (async () => {
    try {
      const docRef = doc(db, "system_settings", "google_workspace");
      const snap = await getDoc(docRef);
      if (snap && snap.exists && snap.exists()) {
        const data = snap.data();
        if (data && data.token && data.timestamp) {
          // Token is valid for 1 hour. We accept it up to 55 minutes (3300000 ms)
          if (Date.now() - data.timestamp < 3300000) {
             cachedAccessToken = data.token;
             try {
               localStorage.setItem("google_access_token", data.token);
             } catch(e) {}
             return data.token;
          }
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
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}
`;

if (!content.includes('getSharedAccessToken')) {
    content = content.replace(
        'export function getCachedAccessToken(): string | null {\n  return cachedAccessToken;\n}',
        newGetCachedAccessToken
    );
}

// Update connectGoogleWorkspace to save the shared token
const newConnectGoogleWorkspace = `
export async function connectGoogleWorkspace(): Promise<string> {
  const provider = getGoogleProvider();
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Failed to capture access token from Google sign-in.");
  }
  
  setCachedAccessToken(credential.accessToken);
  
  // Save to Firestore so other employees can use it
  try {
     const docRef = doc(db, "system_settings", "google_workspace");
     await setDoc(docRef, {
       token: credential.accessToken,
       timestamp: Date.now()
     });
  } catch(e) {
     console.warn("Failed to share token in Firestore", e);
  }
  
  return credential.accessToken;
}
`;

content = content.replace(
    /export async function connectGoogleWorkspace\(\): Promise<string> \{[\s\S]*?return credential\.accessToken;\n\}/,
    newConnectGoogleWorkspace
);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched googleApi.ts with token sharing");
