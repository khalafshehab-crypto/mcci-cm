const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const regex = /function AttachmentInput\(\{\s*label,\s*value,\s*onChange,\s*id\s*\}\s*:\s*AttachmentInputProps\)\s*\{\s*const fileInputId = \`file-input-\$\{id\}\`;[\s\S]*?const handleFileChange = \(e: ChangeEvent<HTMLInputElement>\) => \{/;

const replacement = `function AttachmentInput({ label, value, onChange, id }: AttachmentInputProps) {
  const fileInputId = \`file-input-\${id}\`;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Fixed AttachmentInput");
