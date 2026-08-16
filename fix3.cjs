const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert the helper function
const helper = `
const osMod = require('os');
const pathMod = require('path');
const fsMod = require('fs');

async function uploadBase64ToGemini(ai, fileBase64, mimeType) {
    let base64Data = fileBase64;
    if (base64Data.includes('base64,')) {
        base64Data = base64Data.split('base64,')[1];
    }
    const ext = mimeType === 'application/pdf' ? '.pdf' : '.tmp';
    const tmpPath = pathMod.join(osMod.tmpdir(), 'gemini_upload_' + Date.now() + Math.floor(Math.random() * 1000) + ext);
    fsMod.writeFileSync(tmpPath, Buffer.from(base64Data, 'base64'));
    const upload = await ai.files.upload({ file: tmpPath, mimeType: mimeType });
    fsMod.unlinkSync(tmpPath);
    return upload.uri;
}
`;

code = code.replace(/const executeWithRetry = /, helper + '\nconst executeWithRetry = ');

// In extract-agenda
let extractRegex = /if \(fileId && accessToken && !fileBase64\) \{[\s\S]*?\} else if \(fileBase64 && mimeType\) \{[\s\S]*?\}/;

let newExtract = `if (fileId && accessToken && !fileBase64) {
          try {
              const metaRes = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?fields=mimeType,name\`, {
                  headers: { Authorization: \`Bearer \${accessToken}\` }
              });
              if (metaRes.ok) {
                  const meta = await metaRes.json();
                  mimeType = meta.mimeType;
                  let downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`;
                  let ext = ".pdf";
                  
                  if (mimeType === 'application/vnd.google-apps.document') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.presentation') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=text/csv\`;
                      mimeType = 'text/csv';
                      ext = ".csv";
                  }
                  
                  const fileRes = await fetch(downloadUrl, {
                      headers: { Authorization: \`Bearer \${accessToken}\` }
                  });
                  if (fileRes.ok) {
                      const tmpPath = require('path').join(require('os').tmpdir(), 'gemini_upload_' + Date.now() + ext);
                      const fsMod = require('fs');
                      const arrayBuffer = await fileRes.arrayBuffer();
                      fsMod.writeFileSync(tmpPath, Buffer.from(arrayBuffer));
                      
                      const upload = await ai.files.upload({ file: tmpPath, mimeType: mimeType });
                      uploadedFileUri = upload.uri;
                      uploadedFileMime = mimeType;
                      
                      fsMod.unlinkSync(tmpPath);
                  }
              }
          } catch (e) {
              console.error("Drive fetch error in extract-agenda:", e);
          }
      } else if (fileBase64 && mimeType) {
          uploadedFileUri = await uploadBase64ToGemini(ai, fileBase64, mimeType);
          uploadedFileMime = mimeType;
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }
      
      let contents = [{ text: prompt }];
      if (uploadedFileUri) {
          contents = [
              { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime } },
              { text: prompt }
          ];
      }`;

code = code.replace(extractRegex, newExtract);

// In reply-to-letter
code = code.replace(/let contents: any\[\] = \[fullPrompt\];\s*if \(fileBase64 && mimeType\) \{\s*contents = \[\s*\{ inlineData: \{ data: fileBase64, mimeType: mimeType \} \},\s*fullPrompt\s*\];\s*\}/, 
`let contents: any[] = [{ text: fullPrompt }];
      if (fileBase64 && mimeType) {
        let uri = await uploadBase64ToGemini(ai, fileBase64, mimeType);
        contents = [
          { fileData: { fileUri: uri, mimeType: mimeType } },
          { text: fullPrompt }
        ];
      }`);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts successfully");
