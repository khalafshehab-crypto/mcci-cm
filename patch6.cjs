const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  const regexEdit = /<button\s+type="button"\s+onClick=\{\(\) => handleOpenEdit\(evt\)\}\s+className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"\s+>\s+<span>تعديل التوصية<\/span>\s+<Edit2 className="w-3\.5 h-3\.5" \/>\s+<\/button>/m;
  
  if (regexEdit.test(content)) {
    content = content.replace(regexEdit, `
                                  {!!evt.recommendationType && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(evt)}
                                      className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                    >
                                      <span>تعديل التوصية</span>
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
    `.trim());
    console.log("Patched Edit button in", file);
  }

  const regexDelete = /<button\s+type="button"\s+onClick=\{\(\) => handleOpenDelete\(evt\)\}\s+className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"\s+>\s+<span>حذف التوصية<\/span>\s+<Trash2 className="w-3\.5 h-3\.5" \/>\s+<\/button>/m;

  if (regexDelete.test(content)) {
    content = content.replace(regexDelete, `
                                  {!!evt.recommendationType && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDelete(evt)}
                                      className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                    >
                                      <span>حذف التوصية</span>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
    `.trim());
    console.log("Patched Delete button in", file);
  }

  fs.writeFileSync(file, content);
}

patchFile('src/pages/CommitteesRecommendations.tsx');
patchFile('src/pages/Recommendations.tsx');

