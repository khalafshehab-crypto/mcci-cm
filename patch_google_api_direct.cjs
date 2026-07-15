const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

// Replace fetchGoogleAPI proxy call with direct call
const proxyFetchRegex = /const response = await fetch\("\/api\/google-proxy",\s*\{\s*method:\s*"POST",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json",\s*\},[\s\S]*?body:\s*JSON\.stringify\(\{\s*token,\s*url,\s*method:\s*options\.method\s*\|\|\s*"GET",\s*body:\s*options\.body,\s*headers:\s*reqHeaders,\s*\}\),\s*\}\);/;

const directFetch = `const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Authorization": \`Bearer \${token}\`,
      ...options.headers,
    },
    body: options.body
  });`;
content = content.replace(proxyFetchRegex, directFetch);

// Now for the retry blocks inside fetchGoogleAPI
const proxyRetryRegex = /const retryResponse = await fetch\("\/api\/google-proxy",\s*\{\s*method:\s*"POST",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\},[\s\S]*?body:\s*JSON\.stringify\(\{\s*token:\s*newAccessToken,\s*url,\s*method:\s*options\.method\s*\|\|\s*"GET",\s*body:\s*options\.body,\s*headers:\s*reqHeaders,\s*\}\),\s*\}\);/;

const directRetry = `const retryResponse = await fetch(url, {
            method: options.method || "GET",
            headers: {
              "Authorization": \`Bearer \${newAccessToken}\`,
              ...options.headers,
            },
            body: options.body
          });`;
content = content.replace(proxyRetryRegex, directRetry);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched fetchGoogleAPI");
