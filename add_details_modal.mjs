import fs from 'fs';

let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

const detailsModalCode = `
      {/* Circular Details Modal */}
      <AnimatePresence>
        {circularDetailsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              dir="rtl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    تفاصيل التعميم
                  </h2>
                </div>
                <button
                  onClick={() => setCircularDetailsOpen(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الموضوع:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">
                    {circularDetailsOpen.title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    تم التعميم على اللجان التالية:
                  </label>
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap gap-2">
                    {circularDetailsOpen.targetCommitteesList?.map((c: any) => (
                      <span key={c.id} className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-bold shadow-sm">
                        {c.name}
                      </span>
                    ))}
                    {(!circularDetailsOpen.targetCommitteesList || circularDetailsOpen.targetCommitteesList.length === 0) && (
                      <span className="text-gray-500 text-sm">
                        {circularDetailsOpen.committeeName || "غير محدد"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    روابط الأرشفة السحابية للجان:
                  </label>
                  <div className="space-y-2">
                    {circularDetailsOpen.committeeUrls?.map((cu: any) => (
                      <div key={cu.committeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-700 text-sm">{cu.committeeName}</span>
                        <a
                          href={cu.folderUrl || cu.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          المجلد السحابي
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <button
                  onClick={() => setCircularDetailsOpen(null)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

if(!code.includes('circularDetailsOpen && (')) {
    code = code.replace(/\{(\/\*\s*Share Modal\s*\*\/)/, detailsModalCode + '\n      {$1');
    fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
    console.log("Added details modal.");
} else {
    console.log("Details modal already exists.");
}

