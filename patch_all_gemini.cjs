const fs = require('fs');

const files = [
  'src/lib/geminiClient.ts',
  'src/pages/CommitteesRecommendations.tsx',
  'src/pages/CommitteesLibrary.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/lib/geminiClient.ts') {
    content = content.replace(
      /body: JSON\.stringify\(\{\n\s*prompt,/g,
      "body: JSON.stringify({\n      userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined,\n      prompt,"
    );
    content = content.replace(
      /body: JSON\.stringify\(\{\n\s*incomingLetter,/g,
      "body: JSON.stringify({\n      userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined,\n      incomingLetter,"
    );
  }

  fs.writeFileSync(file, content);
});

