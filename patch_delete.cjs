const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Add state
  content = content.replace(
    'const [isDeletingSelected, setIsDeletingSelected] = useState(false);',
    'const [isDeletingSelected, setIsDeletingSelected] = useState(false);\n  const [isDeletingSelectedLoading, setIsDeletingSelectedLoading] = useState(false);'
  );

  // Update confirmDeleteSelected
  const oldConfirm = `  const confirmDeleteSelected = () => {
    const nextMembers = members.filter(m => !selectedMembers.has(m.id));
    setMembers(nextMembers);
    setSelectedMembers(new Set());
    setIsDeletingSelected(false);
  };`;
  
  const newConfirm = `  const confirmDeleteSelected = async () => {
    setIsDeletingSelectedLoading(true);
    const itemsToDelete = members.filter(m => selectedMembers.has(m.id));
    await Promise.all(itemsToDelete.map(m => deleteFirebaseMember(String(m.id))));
    setSelectedMembers(new Set());
    setIsDeletingSelectedLoading(false);
    setIsDeletingSelected(false);
  };`;
  
  content = content.replace(oldConfirm, newConfirm);

  // Update button in modal
  const oldBtn = `<button
                    onClick={confirmDeleteSelected}
                    className="flex-1 bg-rose-600 text-white hover:bg-rose-700 py-3 rounded-xl font-bold"
                  >
                    حذف بالتأكيد
                  </button>`;
                  
  const newBtn = `<button
                    onClick={confirmDeleteSelected}
                    disabled={isDeletingSelectedLoading}
                    className="flex-1 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center"
                  >
                    {isDeletingSelectedLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      "حذف بالتأكيد"
                    )}
                  </button>`;

  content = content.replace(oldBtn, newBtn);
  
  // Also fix the main button (add key)
  const oldMainBtn = `<motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={handleDeleteSelected}
                className="h-10 px-4 bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
              >`;
              
  const newMainBtn = `<motion.button
                key="bulk-delete-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={handleDeleteSelected}
                className="h-10 px-4 bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
              >`;
              
  content = content.replace(oldMainBtn, newMainBtn);

  fs.writeFileSync(filepath, content);
}

patchFile('src/pages/CommitteesMembers.tsx');
patchFile('src/pages/Members.tsx');
console.log("Patched bulk delete");
