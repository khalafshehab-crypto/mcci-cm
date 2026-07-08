const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const modals = `
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

`;

content = content.replace('{/* 2.5 MODAL: IMPORT EXCEL */}', modals + '{/* 2.5 MODAL: IMPORT EXCEL */}');

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
fs.writeFileSync('src/pages/Members.tsx', content);
console.log("Inserted missing modals");
