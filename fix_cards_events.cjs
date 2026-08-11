const fs = require('fs');

let eContent = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf-8');
const unifiedClass = "bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 relative group flex flex-col justify-between space-y-4";

eContent = eContent.replace(/className="bg-white border-2 border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between space-y-4"/g,
`className="${unifiedClass}"`);

eContent = eContent.replace(/className="bg-white border-2 border-slate-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between space-y-4"/g,
`className="${unifiedClass}"`);

fs.writeFileSync('src/pages/CommitteesEvents.tsx', eContent);
console.log("Patched CommitteesEvents additional cards");
