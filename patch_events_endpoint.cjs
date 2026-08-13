const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(
    /\/api\/gemini\/reply-to-letter/g,
    '/api/gemini/extract-agenda'
  );
  
  content = content.replace(
    /incomingLetter:/g,
    'prompt:'
  );
  
  fs.writeFileSync(file, content);
  console.log('Patched endpoint in ' + file);
}
