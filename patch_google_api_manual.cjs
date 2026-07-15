const fs = require('fs');
let content = fs.readFileSync('src/lib/googleApi.ts', 'utf-8');

function replaceProxy(content) {
  let inUploadFunction = false;
  let lines = content.split('\n');
  let newLines = [];
  
  for(let i=0; i<lines.length; i++) {
    let line = lines[i];
    
    // Replace the fetch("/api/google-proxy") block with direct fetch
    if (line.includes('const response = await fetch("/api/google-proxy"')) {
      // Find the end of this fetch block
      let j = i;
      let openBrackets = 0;
      let foundStart = false;
      while (j < lines.length) {
        if (lines[j].includes('{')) {
          foundStart = true;
          openBrackets += (lines[j].match(/\{/g) || []).length;
        }
        if (lines[j].includes('}')) {
          openBrackets -= (lines[j].match(/\}/g) || []).length;
        }
        if (foundStart && openBrackets <= 0) {
          // If we reach the end of the fetch call block
          if (lines[j].includes('});') || lines[j].includes('})')) {
              break;
          }
        }
        j++;
      }
      
      // We skip the whole block and insert direct fetch
      newLines.push(`  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {`);
      newLines.push(`    method: "POST",`);
      newLines.push(`    headers: {`);
      newLines.push(`      "Authorization": \`Bearer \${token}\`,`);
      newLines.push(`      "Content-Type": \`multipart/related; boundary=\${boundary}\`,`);
      newLines.push(`    },`);
      newLines.push(`    body: multipartBody`);
      newLines.push(`  });`);
      
      i = j; // skip the original block
      continue;
    }
    
    
    // Replace retryResponse
    if (line.includes('const retryResponse = await fetch("/api/google-proxy"')) {
      let j = i;
      let openBrackets = 0;
      let foundStart = false;
      while (j < lines.length) {
        if (lines[j].includes('{')) {
          foundStart = true;
          openBrackets += (lines[j].match(/\{/g) || []).length;
        }
        if (lines[j].includes('}')) {
          openBrackets -= (lines[j].match(/\}/g) || []).length;
        }
        if (foundStart && openBrackets <= 0) {
          if (lines[j].includes('});') || lines[j].includes('})')) {
              break;
          }
        }
        j++;
      }
      
      newLines.push(`  const retryResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {`);
      newLines.push(`    method: "POST",`);
      newLines.push(`    headers: {`);
      newLines.push(`      "Authorization": \`Bearer \${newAccessToken}\`,`);
      newLines.push(`      "Content-Type": \`multipart/related; boundary=\${boundary}\`,`);
      newLines.push(`    },`);
      newLines.push(`    body: multipartBody`);
      newLines.push(`  });`);
      
      i = j;
      continue;
    }
    
    newLines.push(line);
  }
  
  return newLines.join('\n');
}

fs.writeFileSync('src/lib/googleApi.ts', replaceProxy(content));
console.log("Patched proxy calls manually.");
