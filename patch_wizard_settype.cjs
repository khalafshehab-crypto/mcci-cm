const fs = require('fs');

function patch(filepath) {
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');

  code = code.replace(
    /onClick=\{\(\) => \{ setIsWizardOpen\(false\); setIsAddOpen\(true\); \}\} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50\/50 flex items-center justify-between group transition-all">\s*<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">\s*<Presentation className="w-5 h-5" \/>\s*<\/div>\s*<span className="font-bold text-gray-800 group-hover:text-indigo-700">عروض تقديمية<\/span>/g,
    `onClick={() => { setFormType("عروض تقديمية"); setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Presentation className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">عروض تقديمية</span>`
  );

  code = code.replace(
    /onClick=\{\(\) => \{ setIsWizardOpen\(false\); setIsAddOpen\(true\); \}\} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50\/50 flex items-center justify-between group transition-all">\s*<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">\s*<FileSpreadsheet className="w-5 h-5" \/>\s*<\/div>\s*<span className="font-bold text-gray-800 group-hover:text-indigo-700">جداول بيانات<\/span>/g,
    `onClick={() => { setFormType("جداول بيانات"); setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">جداول بيانات</span>`
  );

  code = code.replace(
    /onClick=\{\(\) => \{ setIsWizardOpen\(false\); setIsAddOpen\(true\); \}\} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50\/50 flex items-center justify-between group transition-all">\s*<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">\s*<Mail className="w-5 h-5" \/>\s*<\/div>\s*<span className="font-bold text-gray-800 group-hover:text-indigo-700">بريد إلكتروني<\/span>/g,
    `onClick={() => { setFormType("مستندات"); setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">بريد إلكتروني</span>`
  );

  code = code.replace(
    /onClick=\{\(\) => \{ setIsWizardOpen\(false\); setIsAddOpen\(true\); \}\} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50\/50 flex items-center justify-between group transition-all">\s*<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">\s*<MoreHorizontal className="w-5 h-5" \/>\s*<\/div>\s*<span className="font-bold text-gray-800 group-hover:text-indigo-700">أخرى<\/span>/g,
    `onClick={() => { setFormType("أخرى"); setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">أخرى</span>`
  );

  code = code.replace(
    /onClick=\{\(\) => \{ setIsWizardOpen\(false\); setIsAddOpen\(true\); \}\} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50\/50 flex items-center justify-between group transition-all">\s*<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">\s*<FileText className="w-5 h-5" \/>\s*<\/div>\s*<span className="font-bold text-gray-800 group-hover:text-indigo-700">تعميم<\/span>/g,
    `onClick={() => { setFormType("مستندات"); setFormTitle("تعميم - "); setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">تعميم</span>`
  );

  code = code.replace(
    /onClick=\{\(\) => \{ setIsWizardOpen\(false\); setIsAddOpen\(true\); \}\} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50\/50 flex items-center justify-between group transition-all">\s*<div className="flex items-center gap-3">\s*<div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">\s*<MoreHorizontal className="w-5 h-5" \/>\s*<\/div>\s*<span className="font-bold text-gray-800 group-hover:text-indigo-700">إلخ<\/span>/g,
    `onClick={() => { setFormType("مستندات"); setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">إلخ</span>`
  );

  fs.writeFileSync(filepath, code);
  console.log("Patched setFormType in " + filepath);
}

patch('src/pages/CommitteesLibrary.tsx');
patch('src/pages/Library.tsx');
