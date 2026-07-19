const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

code = code.replace(
`  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${token}\`,
      "Content-Type": \`multipart/related; boundary=\${boundary}\`,
    },
    body: multipartBody
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
            method: "POST",
            headers: {
              "Authorization": \`Bearer \${newAccessToken}\`,
              "Content-Type": \`multipart/related; boundary=\${boundary}\`,
            },
            body: multipartBody
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(\`Google API Error (\${response.status}): \${errText}\`);
  }

  return response.json();`,
`  const response = await fetch("/api/google-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
      method: "POST",
      headers: {
        "Content-Type": \`multipart/related; boundary=\${boundary}\`,
      },
      body: multipartBody
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("/api/google-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: newAccessToken,
              url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
              method: "POST",
              headers: {
                "Content-Type": \`multipart/related; boundary=\${boundary}\`,
              },
              body: multipartBody
            })
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(\`Google API Error (\${response.status}): \${errText}\`);
  }

  return response.json();`
);

code = code.replace(
`  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${token}\`,
      "Content-Type": \`multipart/related; boundary=\${boundary}\`,
    },
    body: multipartBody
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
            method: "POST",
            headers: {
              "Authorization": \`Bearer \${newAccessToken}\`,
              "Content-Type": \`multipart/related; boundary=\${boundary}\`,
            },
            body: multipartBody
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(\`Google API Error (\${response.status}): \${errText}\`);
  }

  return response.json();`,
`  const response = await fetch("/api/google-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
      method: "POST",
      headers: {
        "Content-Type": \`multipart/related; boundary=\${boundary}\`,
      },
      body: multipartBody
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry
          const retryResponse = await fetch("/api/google-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: newAccessToken,
              url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
              method: "POST",
              headers: {
                "Content-Type": \`multipart/related; boundary=\${boundary}\`,
              },
              body: multipartBody
            })
          });
          return retryResponse.json();
        }
      } catch (e) {
        console.error("User rejected re-auth", e);
        throw new Error("Google Workspace Session Expired. Please log in again.");
      }
    }
    const errText = await response.text();
    throw new Error(\`Google API Error (\${response.status}): \${errText}\`);
  }

  return response.json();`
);

fs.writeFileSync('src/lib/googleApi.ts', code);
