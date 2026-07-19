const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const regex = /async function fetchGoogleAPI\(endpoint: string, options: RequestInit = \{\}\): Promise<any> \{[\s\S]*?return response\.json\(\);\n\}/;

const newProxyFunc = `async function fetchGoogleAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getSharedAccessToken();
  if (!token) {
    throw new Error("Authentication required: No active Google Workspace connection.");
  }

  let url = \`https://www.googleapis.com/\${endpoint}\`;
  if (endpoint.startsWith("sheets/")) {
    url = \`https://sheets.googleapis.com/\${endpoint.substring(7)}\`;
  } else if (endpoint.startsWith("docs/")) {
    url = \`https://docs.googleapis.com/\${endpoint.substring(5)}\`;
  } else if (endpoint.startsWith("slides/")) {
    url = \`https://slides.googleapis.com/\${endpoint.substring(7)}\`;
  } else if (endpoint.startsWith("gmail/")) {
    url = \`https://gmail.googleapis.com/\${endpoint.substring(6)}\`;
  } else if (endpoint.startsWith("calendar/")) {
    url = \`https://calendar.googleapis.com/\${endpoint.substring(9)}\`;
  } else if (endpoint.startsWith("tasks/")) {
    url = \`https://tasks.googleapis.com/\${endpoint.substring(6)}\`;
  } else if (endpoint.startsWith("forms/")) {
    url = \`https://forms.googleapis.com/\${endpoint.substring(6)}\`;
  } else if (endpoint.startsWith("chat/")) {
    url = \`https://chat.googleapis.com/\${endpoint.substring(5)}\`;
  }

  const response = await fetch("/api/google-proxy", {
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
  return response.json();
}`;

if (code.match(regex)) {
  code = code.replace(regex, newProxyFunc);
  fs.writeFileSync('src/lib/googleApi.ts', code);
  console.log("Replaced fetchGoogleAPI successfully!");
} else {
  console.log("Regex didn't match.");
}
