const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /} from "lucide-react";/,
    `, Paperclip, Wand2, Loader2 } from "lucide-react";`
  );
  
  // also fix the toast warning / info to success / error or something
  content = content.replace(/"warning"/g, '"error"').replace(/"info"/g, '"success"');
  
  fs.writeFileSync(file, content);
}

// Fix toast in Library
let libContent = fs.readFileSync('src/pages/Library.tsx', 'utf8');
libContent = libContent.replace(/"warning"/g, '"error"').replace(/"info"/g, '"success"');
fs.writeFileSync('src/pages/Library.tsx', libContent);

console.log('Patched imports and toasts');
