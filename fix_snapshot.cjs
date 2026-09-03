const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const originalOnSnapshot = `export function onSnapshot(queryOrColRef: any, onNext: (snap: any) => void, onError?: (err: any) => void): any {
  if (isUseMock()) {
    return mockFb.onSnapshot(queryOrColRef, onNext, onError);
  }
  try {
    return fbOnSnapshot(queryOrColRef, onNext, onError);
  } catch (e) {
    console.warn("onSnapshot fallback on crash", e);
    return mockFb.onSnapshot(queryOrColRef, onNext, onError);
  }
}`;

const newOnSnapshot = `export function onSnapshot(queryOrColRef: any, onNext: (snap: any) => void, onError?: (err: any) => void): any {
  const safeOnError = onError || ((err: any) => {
    console.warn("Firestore snapshot listener error (gracefully caught):", err.message || err);
  });
  
  if (isUseMock()) {
    return mockFb.onSnapshot(queryOrColRef, onNext, safeOnError);
  }
  try {
    return fbOnSnapshot(queryOrColRef, onNext, safeOnError);
  } catch (e) {
    console.warn("onSnapshot fallback on crash", e);
    return mockFb.onSnapshot(queryOrColRef, onNext, safeOnError);
  }
}`;

code = code.replace(originalOnSnapshot, newOnSnapshot);
fs.writeFileSync('src/lib/firebase.ts', code);
