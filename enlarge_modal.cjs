const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

const target1 = `className="bg-white border-2 border-[#b59410]/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col"`;
const new1 = `className="bg-white border-2 border-[#b59410]/20 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col"`;

const target2 = `<div className="w-full h-[500px] bg-slate-50 relative overflow-hidden flex flex-col">`;
const new2 = `<div className="w-full h-[70vh] bg-slate-50 relative overflow-hidden flex flex-col">`;

code = code.replace(target1, new1).replace(target2, new2);
fs.writeFileSync('src/pages/CommitteesHome.tsx', code);
