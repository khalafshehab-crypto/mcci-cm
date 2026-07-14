const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

const targetUploadDrive2 = `  if (!response.ok) {
    if (response.status === 401) setCachedAccessToken(null);
    throw new Error(\`Failed to upload file to drive: \${await response.text()}\`);
  }`;

const replaceUploadDrive2 = `  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        const provider = getGoogleProvider();
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
          // Retry
          const retryResponse = await fetch("/api/google-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: credential.accessToken,
              url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
              method: "POST",
              body: multipartBody,
              headers: {
                "Content-Type": \`multipart/related; boundary=\${boundary}\`,
              }
            }),
          });
          if (!retryResponse.ok) throw new Error("Retry failed");
          return retryResponse.json();
        }
      } catch (refreshErr) {
        setCachedAccessToken(null);
        throw new Error("انتهت صلاحية المزامنة. يرجى تسجيل الدخول مرة أخرى لتفعيل المزامنة.");
      }
    }
    throw new Error(\`Failed to upload file to drive: \${await response.text()}\`);
  }`;

content = content.replace(targetUploadDrive2, replaceUploadDrive2);
fs.writeFileSync('src/lib/googleApi.ts', content);
