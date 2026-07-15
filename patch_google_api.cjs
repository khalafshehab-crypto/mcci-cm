const fs = require('fs');

let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

const injection = `
// --- Global Auth Modal Logic ---
export let authResolve: ((token: string) => void) | null = null;
export let authReject: ((err: any) => void) | null = null;

export function triggerAuthModal(): Promise<string> {
  return new Promise((resolve, reject) => {
    authResolve = resolve;
    authReject = reject;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('show-google-auth-modal'));
    }
  });
}

export function resolveAuthModal(token: string) {
  if (authResolve) authResolve(token);
  authResolve = null;
  authReject = null;
}

export function rejectAuthModal(err: any) {
  if (authReject) authReject(err);
  authResolve = null;
  authReject = null;
}
`;

if (!content.includes("triggerAuthModal")) {
    content = content.replace("export function getCachedAccessToken", injection + "\nexport function getCachedAccessToken");
}

const targetRefreshBlock = `      try {
        const provider = getGoogleProvider();
        
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
          // Retry the request`;

const replacementRefreshBlock = `      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry the request`;

content = content.replace(targetRefreshBlock, replacementRefreshBlock);

const targetRefreshBlock2 = `      try {
        const provider = getGoogleProvider();
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
          const retryResponse = await fetch("/api/google-proxy", {`;

const replacementRefreshBlock2 = `      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          const retryResponse = await fetch("/api/google-proxy", {`;

content = content.replace(targetRefreshBlock2, replacementRefreshBlock2);

const targetRefreshBlock3 = `      try {
        const provider = getGoogleProvider();
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
          // Retry
          const retryResponse = await fetch("/api/google-proxy", {`;

const replacementRefreshBlock3 = `      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("/api/google-proxy", {`;

content = content.replace(targetRefreshBlock3, replacementRefreshBlock3);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched googleApi.ts");
