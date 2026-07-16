const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const replacement = `export async function getOrCreateFolder(name: string, parentId?: string): Promise<string> {
  const safeName = name.replace(/'/g, "\\\\'");
  
  let q = \`mimeType='application/vnd.google-apps.folder' and name='\${safeName}' and trashed=false\`;
  if (parentId) {
    q += \` and '\${parentId}' in parents\`;
  } else {
    q = \`(\${q}) or (mimeType='application/vnd.google-apps.folder' and name='\${safeName}' and trashed=false and sharedWithMe=true)\`;
  }
  
  const files = await listDriveFiles(q);
  if (files && files.length > 0) {
    return files[0].id;
  }
  
  const folder = await createDriveFolder(name, parentId);
  return folder.id;
}`;

const regex = /export async function getOrCreateFolder\([\s\S]*?return newId;\n\}/m;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/lib/googleApi.ts', content);
  console.log("Patched getOrCreateFolder");
} else {
  console.log("Could not find getOrCreateFolder to patch");
}
