const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

const targetStr = `          // Retry the request
          reqHeaders["Authorization"] = \`Bearer \${credential.accessToken}\`;
          fetchOptions.headers = reqHeaders;
          const retryResponse = await fetch(url, fetchOptions);
          if (!retryResponse.ok) {`;
          
const replaceStr = `          // Retry the request
          const retryResponse = await fetch("/api/google-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: credential.accessToken,
              url,
              method: options.method || "GET",
              body: options.body,
              headers: reqHeaders,
            }),
          });
          if (!retryResponse.ok) {`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/lib/googleApi.ts', content);
