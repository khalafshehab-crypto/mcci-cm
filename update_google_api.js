const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const newFunc = `
// Helper to resolve folder path string to a folder ID
export async function resolveDrivePath(pathStr: string): Promise<string> {
  const parts = pathStr.split('/').filter(p => p.trim() !== '');
  let parentId: string | undefined = undefined;
  for (const part of parts) {
    parentId = await getOrCreateFolder(part, parentId);
  }
  return parentId || '';
}

// Uploads a File object to a specific string path in Google Drive
export async function uploadFileToDrivePath(file: File, pathStr: string, newName?: string): Promise<string> {
  const folderId = await resolveDrivePath(pathStr);
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  const finalName = newName || file.name;
  const uploaded = await uploadBinaryFileToDrive(finalName, base64, file.type, folderId);
  return uploaded.webViewLink || \`https://drive.google.com/file/d/\${uploaded.id}/view\`;
}
`;

content += newFunc;
fs.writeFileSync('src/lib/googleApi.ts', content);
console.log('done');
