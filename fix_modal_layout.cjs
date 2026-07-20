const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const regex = /<form onSubmit=\{handleFormSubmit\} className="p-6 space-y-4 overflow-y-auto">([\s\S]*?)\{\/\* Buttons block \*\/}[\s\S]*?<\/form>/;

const match = code.match(regex);
if (match) {
  const replacement = `<form onSubmit={handleFormSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
${match[1].trim()}
                </div>
                {/* Buttons block */}
                <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-gray-50 shrink-0">
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingComm ? "حفظ التعديلات الحالية" : "إضافة وتشكيل اللجنة"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-6 h-11 bg-gray-200 hover:bg-gray-300 text-gray-750 font-extrabold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء الأمر
                  </button>
                </div>
              </form>`;
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
  console.log("Fixed isAddOpen layout successfully!");
} else {
  console.log("Regex for isAddOpen layout failed.");
}
