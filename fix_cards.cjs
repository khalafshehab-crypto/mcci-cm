const fs = require('fs');

const unifiedClass = "bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 relative group flex flex-col justify-between space-y-4";

function replaceCardClass(filePath, regex) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (regex.test(content)) {
    // Keep active/inactive logic if present, but standardize the base
    content = content.replace(regex, (match) => {
        // Find className string
        return match.replace(/className="[^"]+"/, `className="${unifiedClass}"`)
             .replace(/className=\{\`[^`]+\`\}/, (classMatch) => {
                 if (classMatch.includes('!comm.active') || classMatch.includes('!m.active')) {
                     return `className={\`${unifiedClass} \${!comm?.active && !m?.active ? "opacity-50 grayscale-[30%]" : ""}\`}`;
                 }
                 return `className="${unifiedClass}"`;
             });
    });
    fs.writeFileSync(filePath, content);
    console.log("Patched cards in", filePath);
  }
}

// CommitteesFormation
let fContent = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');
fContent = fContent.replace(/className=\{\`bg-\[\#e8e4e4\] hover:bg-\[\#e2dede\] transition-colors duration-300 rounded-2xl p-5 border shadow-sm hover:shadow-md relative group flex flex-col justify-between \$\{\!comm\.active \? "opacity-50 grayscale-\[30\%\] border-gray-300" : "border-gray-200"\}\`\}/g,
`className={\`bg-white border-2 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 relative group flex flex-col justify-between space-y-4 \${!comm.active ? "opacity-50 grayscale-[30%] border-gray-300" : "border-slate-100"}\`}`);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', fContent);
console.log("Patched CommitteesFormation");

// CommitteesMembers
let mContent = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf-8');
mContent = mContent.replace(/className="bg-\[\#e8e4e4\] hover:bg-\[\#e2dede\] hover:shadow-lg rounded-3xl p-5 border border-gray-200 relative flex flex-col justify-between transition-all group duration-300 min-h-\[300px\]"/g,
`className="bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 relative group flex flex-col justify-between space-y-4 min-h-[300px]"`
);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', mContent);
console.log("Patched CommitteesMembers");

// CommitteesEvents - already uses the good one for Level 1! Let's check Level 2 & 3.
let eContent = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf-8');
eContent = eContent.replace(/className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 rounded-2xl p-5 relative group flex flex-col justify-between space-y-4"/g,
`className="bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 relative group flex flex-col justify-between space-y-4"`);

eContent = eContent.replace(/className="bg-white border border-gray-200 hover:border-brand\/40 hover:shadow-md transition-all duration-300 rounded-2xl p-5 relative group flex flex-col justify-between space-y-4"/g,
`className="bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 relative group flex flex-col justify-between space-y-4"`);

fs.writeFileSync('src/pages/CommitteesEvents.tsx', eContent);
console.log("Patched CommitteesEvents");

