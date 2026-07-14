const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf-8');

const targetFunc = `        const uploadAttachment = async (file: File | string | null, label: string) => {
          if (file && typeof file === "object" && "name" in file) {
            const ext = (file as any).name.split('.').pop();
            const fileName = \`\${label} لـ \${name.trim()}.\${ext}\`;
            const base64 = await readFileAsBase64(file as any);
            await uploadBinaryFileToDrive(fileName, base64, (file as any).type, memberFolderId);
            return fileName;
          }
          return typeof file === "string" ? file : "";
        };`;

const replacementFunc = `        const uploadAttachment = async (file: File | string | null, label: string) => {
          if (file && typeof file === "object" && "name" in file) {
            const ext = (file as any).name.split('.').pop();
            const fileName = \`\${label} لـ \${name.trim()}.\${ext}\`;
            const base64 = await readFileAsBase64(file as any);
            const res = await uploadBinaryFileToDrive(fileName, base64 as string, (file as any).type || "application/octet-stream", memberFolderId);
            return res && res.id ? \`https://drive.google.com/file/d/\${res.id}/view\` : fileName;
          }
          return typeof file === "string" ? file : "";
        };`;

content = content.replace(targetFunc, replacementFunc);

// Also replace reader.result
const targetReader = `            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };`;
            
const replaceReader = `            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1] || "");
            };`;
content = content.replace(targetReader, replaceReader);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
