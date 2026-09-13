const fs = require('fs');

const file = '/app/applet/src/lib/googleApi.ts';
let content = fs.readFileSync(file, 'utf8');

// Modify getSharedAccessToken to also look for personal token
const oldGetShared = `export async function getSharedAccessToken(): Promise<string | null> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  
  if (tokenPromise) return tokenPromise;
  
  tokenPromise = (async () => {
    try {
      const docRef = doc(db, "system_settings", "google_workspace");`;

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

      const docRef = doc(db, "system_settings", "google_workspace");`;

content = content.replace(oldGetShared, newGetShared);

fs.writeFileSync(file, content);
console.log('Updated googleApi.ts');
