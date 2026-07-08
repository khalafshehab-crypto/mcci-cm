const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Add `isAddSelectionOpen` state
content = content.replace(
  'const [isImportOpen, setIsImportOpen] = useState(false);',
  'const [isImportOpen, setIsImportOpen] = useState(false);\n  const [isAddSelectionOpen, setIsAddSelectionOpen] = useState(false);'
);

// 2. Change `handleOpenAdd` to be called inside the new modal, and change the button to open the selection modal instead.
// Also replace the "استيراد أعضاء" button with the "حذف المحدد" button.
const actionBarRegex = /\{?\/\*\s*Import Excel button\s*\*\/\s*\}?\s*<button\s*type="button"\s*onClick=\{\(\) => setIsImportOpen\(true\)\}\s*className="h-10 px-4 bg-emerald-[^>]+>\s*<Upload [^>]+>\s*<span>استيراد أعضاء<\/span>\s*<\/button>/;

const newButtons = `          <AnimatePresence>
            {selectedMembers.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={handleDeleteSelected}
                className="h-10 px-4 bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>حذف المحدد ({selectedMembers.size})</span>
              </motion.button>
            )}
          </AnimatePresence>`;

content = content.replace(actionBarRegex, newButtons);

// Change the "إضافة عضو" onClick
content = content.replace(
  'onClick={handleOpenAdd}',
  'onClick={() => setIsAddSelectionOpen(true)}'
);

// 3. Implement handleDeleteSelected
const handleDeleteSelectedCode = `  const handleDeleteSelected = () => {
    if (selectedMembers.size === 0) return;
    if (window.confirm("هل أنت متأكد من حذف الأعضاء المحددين؟ (لا يمكن التراجع عن هذا الإجراء)")) {
      const nextMembers = members.filter(m => !selectedMembers.has(m.id));
      setMembers(nextMembers);
      setSelectedMembers(new Set());
    }
  };

  const toggleMemberSelection = (id: string | number) => {`;

content = content.replace('  const toggleMemberSelection = (id: string | number) => {', handleDeleteSelectedCode);

// 4. Add the selection modal markup.
const selectionModalHtml = `
      {/* ADD SELECTION MODAL */}
      <AnimatePresence>
        {isAddSelectionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddSelectionOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      إضافة أعضاء
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">اختر طريقة الإضافة المناسبة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddSelectionOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSelectionOpen(false);
                    handleOpenAdd();
                  }}
                  className="flex-1 bg-white border-2 border-gray-100 hover:border-blue-500 hover:shadow-md transition-all rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">إضافة مفردة</h4>
                  <p className="text-xs text-gray-500">إدخال بيانات عضو واحد يدوياً</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddSelectionOpen(false);
                    setIsImportOpen(true);
                  }}
                  className="flex-1 bg-white border-2 border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">إضافة مجموعة</h4>
                  <p className="text-xs text-gray-500">استيراد بيانات من ملف Excel</p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MODAL: ADD/EDIT MEMBER DETAILS */}`;

content = content.replace('{/* 2. MODAL: ADD/EDIT MEMBER DETAILS */}', selectionModalHtml);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Patched CommitteesMembers");
