const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const badStr = "              { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime }            const response = await executeWithRetry";

const goodStr = `              { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime } },
              { text: prompt }
          ];
      }
      
      const response = await executeWithRetry`;

code = code.replace(badStr, goodStr);
fs.writeFileSync('server.ts', code);
