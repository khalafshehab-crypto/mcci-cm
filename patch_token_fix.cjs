const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

const replacement = `
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
}
`;

content = content.replace(
    /export async function getSharedAccessToken\(\): Promise<string \| null> \{[\s\S]*?const res = await tokenPromise;\n  tokenPromise = null;\n  return res;\n\}/,
    replacement.trim()
);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched getSharedAccessToken correctly");
