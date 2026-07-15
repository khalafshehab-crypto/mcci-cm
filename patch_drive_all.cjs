const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

// listDriveFiles
content = content.replace(
    /const data = await fetchGoogleAPI\(\`drive\/v3\/files\?\$\{queryParam\}\&fields=files\(id,name,mimeType,webViewLink,iconLink\)\`\);/,
    'const data = await fetchGoogleAPI(`drive/v3/files?${queryParam}&includeItemsFromAllDrives=true&supportsAllDrives=true&fields=files(id,name,mimeType,webViewLink,iconLink)`);'
);

// getOrCreateFolder (it uses listDriveFiles, so that's covered)

// uploadFileToDrive & uploadBinaryFileToDrive (these go to https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart)
content = content.replace(
    /https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?uploadType=multipart/g,
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true'
);

fs.writeFileSync('src/lib/googleApi.ts', content);
console.log("Patched drive files all drives");
