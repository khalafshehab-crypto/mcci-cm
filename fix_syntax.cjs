const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /let contents = \[\{ text: prompt \}\];\s*if \(uploadedFileUri\) \{\s*contents = \[\s*\{ fileData: \{ fileUri: uploadedFileUri, mimeType: uploadedFileMime \} \},\s*\{ text: prompt \}\s*\];\s*\} \},\s*\{ text: prompt \}\s*\];\s*\}/g;

const newStr = `let contents = [{ text: prompt }];
      if (uploadedFileUri) {
          contents = [
              { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime } },
              { text: prompt }
          ];
      }`;

code = code.replace(regex, newStr);

// Let's do a more robust fix in case the regex doesn't match perfectly.
// I will just replace the bad part.
code = code.replace(/\} \},\s*\{ text: prompt \}\s*\];\s*\}/g, '}');

fs.writeFileSync('server.ts', code);
