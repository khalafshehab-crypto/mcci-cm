const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, filelist);
    } else if (filepath.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const files = [
    ...walkSync('/app/applet/src/pages'),
    ...walkSync('/app/applet/src/components')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const replacements = [
    // Cleanup previous partial edits
    { regex: /(?<![:a-zA-Z0-9\-])p-4 sm:p-6(?![-0-9])/g, replace: 'p-3 sm:p-4 md:p-6' },
    { regex: /(?<![:a-zA-Z0-9\-])gap-4 sm:gap-6(?![-0-9])/g, replace: 'gap-3 sm:gap-4 md:gap-6' },
    { regex: /(?<![:a-zA-Z0-9\-])gap-3 sm:gap-5(?![-0-9])/g, replace: 'gap-2.5 sm:gap-3 md:gap-5' },
    
    // Spacing
    { regex: /(?<![:a-zA-Z0-9\-])p-6(?![-0-9])/g, replace: 'p-3 sm:p-4 md:p-6' },
    { regex: /(?<![:a-zA-Z0-9\-])p-5(?![-0-9])/g, replace: 'p-3 sm:p-4 md:p-5' },
    { regex: /(?<![:a-zA-Z0-9\-])p-8(?![-0-9])/g, replace: 'p-4 sm:p-6 md:p-8' },
    { regex: /(?<![:a-zA-Z0-9\-])p-10(?![-0-9])/g, replace: 'p-5 sm:p-8 md:p-10' },
    { regex: /(?<![:a-zA-Z0-9\-])px-6(?![-0-9])/g, replace: 'px-3 sm:px-4 md:px-6' },
    { regex: /(?<![:a-zA-Z0-9\-])py-6(?![-0-9])/g, replace: 'py-3 sm:py-4 md:py-6' },
    { regex: /(?<![:a-zA-Z0-9\-])px-5(?![-0-9])/g, replace: 'px-3 sm:px-4 md:px-5' },
    { regex: /(?<![:a-zA-Z0-9\-])py-5(?![-0-9])/g, replace: 'py-3 sm:py-4 md:py-5' },
    
    // Gaps
    { regex: /(?<![:a-zA-Z0-9\-])gap-8(?![-0-9])/g, replace: 'gap-4 sm:gap-6 md:gap-8' },
    { regex: /(?<![:a-zA-Z0-9\-])gap-6(?![-0-9])/g, replace: 'gap-3 sm:gap-4 md:gap-6' },
    { regex: /(?<![:a-zA-Z0-9\-])gap-5(?![-0-9])/g, replace: 'gap-2.5 sm:gap-4 md:gap-5' },
    { regex: /(?<![:a-zA-Z0-9\-])gap-4(?![-0-9])/g, replace: 'gap-2.5 sm:gap-3 md:gap-4' },
    
    // Typography
    { regex: /(?<![:a-zA-Z0-9\-])text-4xl(?![-0-9])/g, replace: 'text-2xl sm:text-3xl md:text-4xl' },
    { regex: /(?<![:a-zA-Z0-9\-])text-3xl(?![-0-9])/g, replace: 'text-xl sm:text-2xl md:text-3xl' },
    { regex: /(?<![:a-zA-Z0-9\-])text-2xl(?![-0-9])/g, replace: 'text-lg sm:text-xl md:text-2xl' },
    { regex: /(?<![:a-zA-Z0-9\-])text-xl(?![-0-9])/g, replace: 'text-base sm:text-lg md:text-xl' },
    { regex: /(?<![:a-zA-Z0-9\-])text-lg(?![-0-9])/g, replace: 'text-sm sm:text-base md:text-lg' },
    
    // Borders / Shapes
    { regex: /(?<![:a-zA-Z0-9\-])rounded-3xl(?![-0-9])/g, replace: 'rounded-2xl sm:rounded-3xl' },
    { regex: /(?<![:a-zA-Z0-9\-])rounded-2xl(?![-0-9])/g, replace: 'rounded-xl sm:rounded-2xl' },
    
    // Sizing (Icons / Avatars / Containers)
    { regex: /(?<![:a-zA-Z0-9\-])w-24 h-24(?![-0-9])/g, replace: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24' },
    { regex: /(?<![:a-zA-Z0-9\-])w-20 h-20(?![-0-9])/g, replace: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20' },
    { regex: /(?<![:a-zA-Z0-9\-])w-16 h-16(?![-0-9])/g, replace: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16' },
    { regex: /(?<![:a-zA-Z0-9\-])w-12 h-12(?![-0-9])/g, replace: 'w-10 h-10 sm:w-12 sm:h-12' },
    
    // Inputs / Buttons padding
    { regex: /(?<![:a-zA-Z0-9\-])px-4 py-2\.5(?![-0-9])/g, replace: 'px-3 sm:px-4 py-2 sm:py-2.5' },
    { regex: /(?<![:a-zA-Z0-9\-])px-6 py-2\.5(?![-0-9])/g, replace: 'px-4 sm:px-6 py-2 sm:py-2.5' },
  ];

  let originalContent = content;
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  
  if (originalContent !== content) {
    fs.writeFileSync(file, content);
    console.log(`Refactored ${file}`);
  }
}
