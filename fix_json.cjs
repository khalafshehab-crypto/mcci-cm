const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix 1
  content = content.replace(
    'const errData = await response.json();',
    'const textErr = await response.text(); const errData = textErr ? JSON.parse(textErr) : {};'
  );

  // Fix 2
  content = content.replace(
    'const responseData = await response.json();',
    'const textRes = await response.text(); const responseData = textRes ? JSON.parse(textRes) : {};'
  );

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
}

fixFile('src/pages/CommitteesEvents.tsx');
fixFile('src/pages/Events.tsx');
