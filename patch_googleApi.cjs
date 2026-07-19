const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const regexFolder = /export async function getOrCreateFolder\(name: string, parentId\?: string\): Promise<string> \{[\s\S]*?const folder = await createDriveFolder\(name, parentId\);\n  return folder\.id;\n\}/m;

const replacementFolder = `export async function getOrCreateFolder(name: string, parentId?: string): Promise<string> {
  const safeName = name.replace(/'/g, "\\\\'");
  
  let q = \`mimeType='application/vnd.google-apps.folder' and name='\${safeName}' and trashed=false\`;
  if (parentId) {
    q += \` and '\${parentId}' in parents\`;
  }
  
  const files = await listDriveFiles(q);
  if (files && files.length > 0) {
    return files[0].id;
  }
  
  const folder = await createDriveFolder(name, parentId);
  return folder.id;
}`;

content = content.replace(regexFolder, replacementFolder);
fs.writeFileSync('src/lib/googleApi.ts', content);
