const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

// We need to inject the popup refresh logic in fetchGoogleAPI
const targetFetchAPI = `  if (!response.ok) {
    if (response.status === 401) {
      setCachedAccessToken(null); // Clear expired token
    }
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch(e) {}
    throw new Error(parsedErr?.error?.message || \`API error (\${response.status}): \${errText}\`);
  }`;
  
const replacementFetchAPI = `  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        const provider = getGoogleProvider();
        const { signInWithPopup } = require("firebase/auth");
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
          // Retry the request
          reqHeaders["Authorization"] = \`Bearer \${credential.accessToken}\`;
          fetchOptions.headers = reqHeaders;
          const retryResponse = await fetch(url, fetchOptions);
          if (!retryResponse.ok) {
            throw new Error("Retry failed after token refresh");
          }
          if (retryResponse.status === 204) return true;
          return retryResponse.json();
        }
      } catch (refreshErr) {
        console.error("Refresh failed:", refreshErr);
        setCachedAccessToken(null);
        throw new Error("انتهت صلاحية المزامنة. يرجى تسجيل الدخول مرة أخرى لتفعيل المزامنة.");
      }
    }
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch(e) {}
    throw new Error(parsedErr?.error?.message || \`API error (\${response.status}): \${errText}\`);
  }`;

content = content.replace(targetFetchAPI, replacementFetchAPI);
fs.writeFileSync('src/lib/googleApi.ts', content);
