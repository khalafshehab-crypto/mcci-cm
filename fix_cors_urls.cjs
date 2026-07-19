const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

// Replace fetchGoogleAPI
code = code.replace(
`  const response = await fetch("/api/google-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      url,
      method: options.method || "GET",
      headers: options.headers || {},
      body: options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined
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
          const retryResponse = await fetch("/api/google-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: newAccessToken,
              url,
              method: options.method || "GET",
              headers: options.headers || {},
              body: options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined
            })
          });
          if (retryResponse.status === 204) return null;
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

  if (response.status === 204) return null;
  return response.json();`,
`  const reqHeaders = {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${token}\`,
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: reqHeaders,
    body: options.body
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Google API 401: Token expired. Attempting silent refresh...");
      try {
        console.warn("Google API 401: Pausing and requesting user to re-authenticate via UI...");
        const newAccessToken = await triggerAuthModal();
        if (newAccessToken) {
          setCachedAccessToken(newAccessToken);
          // Retry the request
          const retryResponse = await fetch(url, {
            method: options.method || "GET",
            headers: {
              "Authorization": \`Bearer \${newAccessToken}\`,
              ...options.headers,
            },
            body: options.body
          });
          if (retryResponse.status === 204) return null;
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

  if (response.status === 204) return null;
  return response.json();`
);

// Replace uploadFileToDrive and uploadBinaryFileToDrive proxy blocks
const proxyUploadBlock = `  const response = await fetch("/api/google-proxy", {
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

  return response.json();`;

const directUploadBlock = `  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
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

  return response.json();`;

code = code.replace(proxyUploadBlock, directUploadBlock);
code = code.replace(proxyUploadBlock, directUploadBlock);

// Replace Gmail
const proxyGmailBlock = `  const response = await fetch("/api/gmail-send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, raw }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch (e) {}
    throw new Error(parsedErr?.error?.message || \`Proxy API error (\${response.status}): \${errText}\`);
  }

  return response.json();`;

const directGmailBlock = `  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${token}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw })
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
          const retryResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
            method: "POST",
            headers: {
              "Authorization": \`Bearer \${newAccessToken}\`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw })
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

  return response.json();`;

code = code.replace(proxyGmailBlock, directGmailBlock);

fs.writeFileSync('src/lib/googleApi.ts', code);
