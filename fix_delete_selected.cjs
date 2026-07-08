const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Add isDeletingSelected state
content = content.replace(
  'const [isDeletingStep, setIsDeletingStep] = useState(false);',
  'const [isDeletingStep, setIsDeletingStep] = useState(false);\n  const [isDeletingSelected, setIsDeletingSelected] = useState(false);'
);

// 2. Change handleDeleteSelected
const newHandleDeleteSelected = `  const handleDeleteSelected = () => {
    if (selectedMembers.size === 0) return;
    setIsDeletingSelected(true);
  };

  const confirmDeleteSelected = () => {
    const nextMembers = members.filter(m => !selectedMembers.has(m.id));
    setMembers(nextMembers);
    setSelectedMembers(new Set());
    setIsDeletingSelected(false);
  };`;

content = content.replace(
  /  const handleDeleteSelected = \(\) => \{\s+if \(selectedMembers.size === 0\) return;\s+if \(window\.confirm\([^\)]+\)\) \{\s+const nextMembers = members\.filter\(m => !selectedMembers\.has\(m\.id\)\);\s+setMembers\(nextMembers\);\s+setSelectedMembers\(new Set\(\)\);\s+\}\s+\};/,
  newHandleDeleteSelected
);

// 3. Add the modal html
const selectionModalHtml = `
      {/* ADD SELECTION MODAL */}`;

const bulkDeleteModal = `
      {/* BULK DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeletingSelected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeletingSelected(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
                <p className="text-gray-500 mb-6">
                  هل أنت متأكد من حذف {selectedMembers.size} عضو محدد؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeletingSelected(false)}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmDeleteSelected}
                    className="flex-1 bg-rose-600 text-white hover:bg-rose-700 py-3 rounded-xl font-bold"
                  >
                    حذف بالتأكيد
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* ADD SELECTION MODAL */}`;

content = content.replace('{/* ADD SELECTION MODAL */}', bulkDeleteModal);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
fs.writeFileSync('src/pages/Members.tsx', content);
console.log("Patched bulk delete modal");
