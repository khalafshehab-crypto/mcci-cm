const fs = require('fs');
const file = 'src/pages/CommitteesLibrary.tsx';
let code = fs.readFileSync(file, 'utf8');

const downloadFuncRegex = /if \(t\.type === "تعميم"\) \{[\s\S]*?return;\s*\}/;
const replacement = `if (t.type === "تعميم") {
      let urlToOpen = t.downloadUrl && t.downloadUrl !== "#" ? t.downloadUrl :
                      (t.cloudUrl && t.cloudUrl !== "#" ? t.cloudUrl :
                      (t.committeeUrls && t.committeeUrls.length > 0 && t.committeeUrls[0].documentUrl && t.committeeUrls[0].documentUrl !== "#" ? t.committeeUrls[0].documentUrl : null));
      
      if (urlToOpen) {
          // If it's a drive file link, try to make it direct download if possible
          let match = urlToOpen.match(/\\/file\\/d\\/([a-zA-Z0-9_-]+)/);
          if (!match) match = urlToOpen.match(/id=([a-zA-Z0-9_-]+)/);
          
          if (match && match[1]) {
              window.open(\`https://drive.google.com/uc?export=download&id=\${match[1]}\`, '_blank');
          } else {
              window.open(urlToOpen, '_blank');
          }
      } else {
        alert("لا يوجد ملف متاح للتحميل.");
      }
      return;
    }`;

code = code.replace(downloadFuncRegex, replacement);
fs.writeFileSync(file, code);
