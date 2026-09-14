const fs = require('fs');
const file = 'src/lib/googleApi.ts';
let content = fs.readFileSync(file, 'utf8');

// Update import
if (!content.includes('signInWithRedirect')) {
  content = content.replace('signInWithPopup, signOut', 'signInWithPopup, signInWithRedirect, signOut');
}
if (!content.includes('signInWithRedirect') && content.includes('signInWithPopup }')) {
    content = content.replace('signInWithPopup }', 'signInWithPopup, signInWithRedirect }');
}

const oldFunc = `export async function connectGoogleWorkspace(): Promise<string> {
  const provider = getGoogleProvider();
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Failed to capture access token from Google sign-in.");
  }
  
  setCachedAccessToken(credential.accessToken);
  
  // Try to update personal token
  try {
    if (result.user?.email) {
       const tokenRef = doc(db, "employee_tokens", result.user.email.toLowerCase());
       await setDoc(tokenRef, {
         token: credential.accessToken,
         timestamp: Date.now()
       }, { merge: true });
    }
  } catch(e) {
    console.warn("Failed to update personal token", e);
  }
  
  return credential.accessToken;
}`;

const newFunc = `export async function connectGoogleWorkspace(): Promise<string> {
  const provider = getGoogleProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to capture access token from Google sign-in.");
    }
    
    setCachedAccessToken(credential.accessToken);
    
    try {
      if (result.user?.email) {
         const tokenRef = doc(db, "employee_tokens", result.user.email.toLowerCase());
         await setDoc(tokenRef, {
           token: credential.accessToken,
           timestamp: Date.now()
         }, { merge: true });
      }
    } catch(e) {
      console.warn("Failed to update personal token", e);
    }
    
    return credential.accessToken;
  } catch (err: any) {
    if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, provider);
      // Wait for redirect, it will navigate away
      return ""; 
    }
    throw err;
  }
}`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync(file, content);
console.log('Fixed googleApi.ts');
