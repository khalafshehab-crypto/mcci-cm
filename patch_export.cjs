const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const oldBlock = `  if (mimeType.includes('application/vnd.google-apps.')) {
     downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
     finalMimeType = 'application/pdf';
  }`;

const newBlock = `  if (mimeType.includes('application/vnd.google-apps.')) {
     if (mimeType === 'application/vnd.google-apps.spreadsheet') {
         downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=text/csv\`;
         finalMimeType = 'text/csv';
     } else if (mimeType === 'application/vnd.google-apps.presentation') {
         downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
         finalMimeType = 'application/pdf';
     } else if (mimeType === 'application/vnd.google-apps.document') {
         downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
         finalMimeType = 'application/pdf';
     } else {
         throw new Error("Cannot download this type of Google Workspace file: " + mimeType);
     }
  }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/lib/googleApi.ts', content);
console.log('Patched export');
