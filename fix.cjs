const fs = require('fs');

const files = [
  'src/pages/Recommendations.tsx', 
  'src/pages/CommitteesRecommendations.tsx', 
  'src/pages/Home.tsx', 
  'src/pages/CommitteesHome.tsx'
];

const attributesToFix = [
  'className',
  'style',
  'd',
  'fill',
  'transform',
  'key',
  'initial',
  'animate',
  'exit'
];

files.forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  
  attributesToFix.forEach(attr => {
    // We look for attr={` ... and find the end
    // The regex matches attr={` followed by anything up to a JSX boundary like ` className=` or `>`
    
    // We will use a loop to process them safely
    let regex = new RegExp(attr + '=\\{`([^`]*?)(?=\\s+[a-zA-Z0-9_-]+=|\\s*>|\\s*\\/>)', 'g');
    
    text = text.replace(regex, (match, inner) => {
      // If inner already contains `}, we don't touch it
      if (inner.includes('`}')) return match;
      
      // Otherwise we append `}
      return attr + '={`' + inner + '`}';
    });
  });
  
  // also fix layoutId={`...
  // wait, I removed layoutId entirely. That's fine.
  
  fs.writeFileSync(file, text);
});
