const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const regex = /\{\/\* Merged Add\/Import\/Export Dropdown \*\/\}\s*<div className="relative">[\s\S]*?<\/AnimatePresence>\s*<\/div>/;

const replacement = `{/* Committees Actions Button */}
          <button
            type="button"
            onClick={() => {
              setActionType("إضافة");
              handleOpenAdd();
            }}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>إجراءات اللجان</span>
          </button>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
    console.log("Patched dropdown successfully!");
} else {
    console.log("Could not find the dropdown block.");
}
