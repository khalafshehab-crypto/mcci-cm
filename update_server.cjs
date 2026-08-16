const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const oldEndpoint = `  app.post("/api/gemini/extract-agenda", async (req, res) => {
    try {
      const { prompt, fileBase64, mimeType } = req.body;`;
      
const newEndpoint = `  app.post("/api/gemini/extract-agenda", async (req, res) => {
    try {
      let { prompt, fileBase64, mimeType, fileId, accessToken } = req.body;

      if (fileId && accessToken && !fileBase64) {
          try {
              const metaRes = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?fields=mimeType\`, {
                  headers: { Authorization: \`Bearer \${accessToken}\` }
              });
              if (metaRes.ok) {
                  const meta = await metaRes.json();
                  mimeType = meta.mimeType;
                  let downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`;
                  
                  if (mimeType === 'application/vnd.google-apps.document') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.presentation') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=text/csv\`;
                      mimeType = 'text/csv';
                  }
                  
                  const fileRes = await fetch(downloadUrl, {
                      headers: { Authorization: \`Bearer \${accessToken}\` }
                  });
                  if (fileRes.ok) {
                      const arrayBuffer = await fileRes.arrayBuffer();
                      fileBase64 = Buffer.from(arrayBuffer).toString('base64');
                  } else {
                      console.error("Failed to download from Drive:", await fileRes.text());
                  }
              }
          } catch (e) {
              console.error("Drive fetch error in extract-agenda:", e);
          }
      }`;

content = content.replace(oldEndpoint, newEndpoint);

fs.writeFileSync('server.ts', content);
console.log("Updated server.ts");
