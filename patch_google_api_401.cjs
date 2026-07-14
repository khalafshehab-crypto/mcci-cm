const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

const targetFetchAPI = `  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch(e) {}
    throw new Error(parsedErr?.error?.message || \`API error (\${response.status}): \${errText}\`);
  }`;
  
const replacementFetchAPI = `  if (!response.ok) {
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

content = content.replace(targetFetchAPI, replacementFetchAPI);

const targetUploadDrive1 = `  if (!response.ok) {
    throw new Error(\`File upload failed: \${await response.text()}\`);
  }`;
  
const replaceUploadDrive1 = `  if (!response.ok) {
    if (response.status === 401) setCachedAccessToken(null);
    throw new Error(\`File upload failed: \${await response.text()}\`);
  }`;
  
content = content.replace(targetUploadDrive1, replaceUploadDrive1);

const targetUploadDrive2 = `  if (!response.ok) {
    throw new Error(\`Failed to upload file to drive: \${await response.text()}\`);
  }`;
  
const replaceUploadDrive2 = `  if (!response.ok) {
    if (response.status === 401) setCachedAccessToken(null);
    throw new Error(\`Failed to upload file to drive: \${await response.text()}\`);
  }`;
  
content = content.replace(targetUploadDrive2, replaceUploadDrive2);

fs.writeFileSync('src/lib/googleApi.ts', content);
