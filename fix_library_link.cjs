const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

// In handleFormSubmit
content = content.replace(/driveFolderId: folderId,/g, `driveFolderId: folderId,
            libraryLink: folderId ? \`https://drive.google.com/drive/folders/\${folderId}\` : googleDriveUrl,`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched libraryLink in CommitteesFormation");
