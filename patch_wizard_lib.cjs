const fs = require('fs');
const filepath = 'src/pages/Library.tsx';
if (!fs.existsSync(filepath)) {
  console.log("No Library.tsx");
  process.exit(0);
}
let code = fs.readFileSync(filepath, 'utf8');

// 1. Add new icons to lucide-react import
const iconRegex = /import\s+\{([^}]+)\}\s+from\s+"lucide-react";/;
const match = code.match(iconRegex);
if (match) {
  let icons = match[1];
  const newIcons = ["FileText", "Presentation", "FileSpreadsheet", "Mail", "MoreHorizontal", "ChevronLeft", "ChevronRight", "Plus", "Reply"];
  newIcons.forEach(icon => {
    if (!icons.includes(icon)) {
      icons += `, ${icon}`;
    }
  });
  code = code.replace(iconRegex, `import { ${icons} } from "lucide-react";`);
}

// 2. Update smartLetterMode state definition
code = code.replace(
  'const [smartLetterMode, setSmartLetterMode] = useState<"create" | "fill">("create");',
  'const [smartLetterMode, setSmartLetterMode] = useState<"create_new" | "create_reply" | "fill">("create_new");'
);
code = code.replace(
  /const \[smartLetterMode, setSmartLetterMode\] = useState<"create" \| "fill">\(.*?\);/,
  'const [smartLetterMode, setSmartLetterMode] = useState<"create_new" | "create_reply" | "fill">("create_new");'
);

// 3. Add wizard state
if (!code.includes('isWizardOpen')) {
  code = code.replace(
    'const [isSmartLetterOpen, setIsSmartLetterOpen] = useState(false);',
    'const [isSmartLetterOpen, setIsSmartLetterOpen] = useState(false);\n  const [isWizardOpen, setIsWizardOpen] = useState(false);\n  const [wizardStep, setWizardStep] = useState<"type" | "doc_subtype" | "letter_type">("type");'
  );
}

// 4. Replace openCreateSmartLetter usage with openWizard in the button
code = code.replace(
  /onClick=\{openCreateSmartLetter\}/g,
  'onClick={() => { setWizardStep("type"); setIsWizardOpen(true); }}'
);
// Replace the button text to just "إنشاء قالب"
code = code.replace(
  /<span[^>]*>إنشاء قالب خطابات<\/span>/g,
  '<span>إنشاء قالب</span>'
);

// 5. Inject wizard modal before Smart Letter Modal
const wizardModalJSX = `
      {/* Template Creation Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsWizardOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-lg z-10 flex flex-col"
              dir="rtl"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {wizardStep === "type" && "إنشاء قالب جديد"}
                  {wizardStep === "doc_subtype" && "اختيار نوع المستند"}
                  {wizardStep === "letter_type" && "نوع الخطاب"}
                </h2>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-3">
                {wizardStep === "type" && (
                  <>
                    <button onClick={() => setWizardStep("doc_subtype")} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">مستندات</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    <button onClick={() => { setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Presentation className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">عروض تقديمية</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    <button onClick={() => { setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">جداول بيانات</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    <button onClick={() => { setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">بريد إلكتروني</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    <button onClick={() => { setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">أخرى</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                  </>
                )}

                {wizardStep === "doc_subtype" && (
                  <>
                    <button onClick={() => setWizardStep("letter_type")} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">خطاب</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    <button onClick={() => { setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">تعميم</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    <button onClick={() => { setIsWizardOpen(false); setIsAddOpen(true); }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                          <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-indigo-700">إلخ</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                  </>
                )}

                {wizardStep === "letter_type" && (
                  <>
                    <button onClick={() => {
                      setSmartLetterMode("create_new");
                      setSlTitle("");
                      setSlContent("");
                      setSlVariables([]);
                      setSlValues({});
                      setIsSmartLetterOpen(true);
                      setIsWizardOpen(false);
                    }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800 group-hover:text-indigo-700">جديد</div>
                          <div className="text-xs text-gray-500 mt-0.5">إنشاء قالب خطاب جديد من الصفر</div>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    
                    <button onClick={() => {
                      setSmartLetterMode("create_reply");
                      setSlTitle("");
                      setSlContent("");
                      setSlVariables([]);
                      setSlValues({});
                      setIsSmartLetterOpen(true);
                      setIsWizardOpen(false);
                    }} className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          <Reply className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800 group-hover:text-indigo-700">رد</div>
                          <div className="text-xs text-gray-500 mt-0.5">إعداد قالب رد تلقائي على خطاب وارد</div>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                  </>
                )}
              </div>
              
              {wizardStep !== "type" && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center">
                  <button
                    onClick={() => {
                      if (wizardStep === "doc_subtype") setWizardStep("type");
                      if (wizardStep === "letter_type") setWizardStep("doc_subtype");
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    عودة
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Letter Modal */}
`;

if (!code.includes('{/* Template Creation Wizard Modal */}')) {
  code = code.replace('{/* Smart Letter Modal */}', wizardModalJSX);
}

// 6. Update Smart Letter Modal content visibility based on new modes
code = code.replace(
  /{smartLetterMode === "create" \? "إنشاء قالب خطابات ذكي أو إعداد رد" : "تعبئة خطاب ذكي"}/g,
  '{smartLetterMode === "create_new" ? "إنشاء قالب خطابات ذكي" : smartLetterMode === "create_reply" ? "إعداد رد ذكي" : "تعبئة خطاب ذكي"}'
);
code = code.replace(
  /{smartLetterMode === "create" \? "أدخل نص الخطاب الجديد، أو أرفق خطاباً وارداً لإنشاء رد تلقائي" : "قم بتعبئة المتغيرات لمعاينة الخطاب وتصديره"}/g,
  '{smartLetterMode === "create_new" ? "قم بإدخال قالب الخطاب وعنوانه" : smartLetterMode === "create_reply" ? "أدخل نص الخطاب الوارد أو أرفق ملفاً لإنشاء رد تلقائي" : "قم بتعبئة المتغيرات لمعاينة الخطاب وتصديره"}'
);

code = code.replace(
  /\{smartLetterMode === "create" && \(/g,
  '{(smartLetterMode === "create_new" || smartLetterMode === "create_reply") && ('
);

code = code.replace(
  /<div className="bg-indigo-50\/50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">/g,
  '{smartLetterMode === "create_reply" && (<div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">'
);
code = code.replace(
  /<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">/,
  '</button></div></div></div>)}<div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">'
);

code = code.replace(
  /\{smartLetterMode === "create" && \(/g,
  '{(smartLetterMode === "create_new" || smartLetterMode === "create_reply") && ('
);

fs.writeFileSync(filepath, code);
console.log("Patched " + filepath);
