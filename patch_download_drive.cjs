const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const newFunc = `
export async function downloadDriveFileBase64(fileIdOrUrl: string): Promise<{ base64: string, mimeType: string }> {
  let fileId = fileIdOrUrl;
  const match = fileIdOrUrl.match(/[-\\w]{25,}/);
  if (match) fileId = match[0];
  
  const token = await getSharedAccessToken();
  if (!token) throw new Error("No Google token found");
  
  const metaRes = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?fields=mimeType\`, {
    headers: { Authorization: \`Bearer \${token}\` }
  });
  if (!metaRes.ok) throw new Error("Failed to fetch file metadata");
  const meta = await metaRes.json();
  const mimeType = meta.mimeType;
  
  let downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`;
  let finalMimeType = mimeType;
  
  if (mimeType.includes('application/vnd.google-apps.')) {
     downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
     finalMimeType = 'application/pdf';
  }
  
  const res = await fetch(downloadUrl, {
    headers: { Authorization: \`Bearer \${token}\` }
  });
  if (!res.ok) throw new Error("Failed to download file");
  const blob = await res.blob();
  
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });
  
  return { base64, mimeType: finalMimeType };
}
`;

content = content + '\n' + newFunc;
fs.writeFileSync('src/lib/googleApi.ts', content);
console.log('Added downloadDriveFileBase64');
