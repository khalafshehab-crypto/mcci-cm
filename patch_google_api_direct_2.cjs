const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

// Replace uploadFileToDrive proxy call with direct call
const proxyFetchRegex2 = /const response = await fetch\("\/api\/google-proxy",\s*\{\s*method:\s*"POST",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json",\s*\},[\s\S]*?body:\s*JSON\.stringify\(\{\s*token,\s*url:\s*"https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?uploadType=multipart",\s*method:\s*"POST",\s*body:\s*multipartBody,\s*headers:\s*\{\s*"Content-Type":\s*`multipart\/related; boundary=\\$\\{boundary\\}`,\s*\},\s*\}\),\s*\}\);/g;

const directFetch2 = `const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${token}\`,
      "Content-Type": \`multipart/related; boundary=\${boundary}\`,
    },
    body: multipartBody
  });`;
content = content.replace(proxyFetchRegex2, directFetch2);


// Replace the retry logic inside uploadFileToDrive and uploadBinaryFileToDrive
const proxyRetryRegex2 = /const retryResponse = await fetch\("\/api\/google-proxy",\s*\{\s*method:\s*"POST",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\},[\s\S]*?body:\s*JSON\.stringify\(\{\s*token:\s*newAccessToken,\s*url:\s*"https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?uploadType=multipart",\s*method:\s*"POST",\s*body:\s*multipartBody,\s*headers:\s*\{\s*"Content-Type":\s*`multipart\/related; boundary=\\$\\{boundary\\}`,\s*\},\s*\}\),\s*\}\);/g;

const directRetry2 = `const retryResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
            method: "POST",
            headers: {
              "Authorization": \`Bearer \${newAccessToken}\`,
              "Content-Type": \`multipart/related; boundary=\${boundary}\`,
            },
            body: multipartBody
          });`;
content = content.replace(proxyRetryRegex2, directRetry2);


fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched upload functions");
