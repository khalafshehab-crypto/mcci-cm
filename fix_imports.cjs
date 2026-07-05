const fs = require('fs');
const files = ['src/pages/Library.tsx', 'src/pages/CommitteesLibrary.tsx'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const startIdx = content.indexOf('import {');
  const endIdx = content.indexOf('} from "lucide-react";');
  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const block = content.substring(startIdx, endIdx);
    const words = block.match(/[a-zA-Z0-9]+/g).filter(w => w !== 'import');
    ['Wand2', 'Loader2', 'Printer', 'X'].forEach(w => {
      if (!words.includes(w)) {
        words.push(w);
      }
    });
    const unique = [...new Set(words)].sort();
    const newBlock = "import {\n  " + unique.join(",\n  ") + "\n} from 'lucide-react';";
    content = content.replace(content.substring(startIdx, endIdx + '} from "lucide-react";'.length), newBlock);
    fs.writeFileSync(file, content);
    console.log("Fixed imports in " + file);
  }
});
