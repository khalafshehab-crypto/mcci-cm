import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

connect = r'''export async function connectGoogleWorkspace(): Promise<string> {
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
}'''

new_connect = r'''export async function connectGoogleWorkspace(): Promise<string> {
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
  
  // Save to Firestore so other employees can use it
  try {
     const docRef = doc(db, "system_settings", "google_workspace");
     await setDoc(docRef, {
       token: credential.accessToken,
       timestamp: Date.now()
     }, { merge: true });
  } catch(e) {
     console.warn("Failed to share token in Firestore", e);
  }
  
  return credential.accessToken;
}'''

content = content.replace(connect, new_connect)

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
