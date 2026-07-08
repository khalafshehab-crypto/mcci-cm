const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const btn = `
          {/* Import Excel button */}
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>استيراد أعضاء</span>
          </button>

          {/* Add member button */}
`;

content = content.replace(/          \{\/\* Add member button \*\/\}/g, btn);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Patched btn");
