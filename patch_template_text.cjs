const fs = require('fs');

const files = ['src/pages/Library.tsx', 'src/pages/CommitteesLibrary.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add state
  if (!content.includes('const [formTemplateText, setFormTemplateText]')) {
    content = content.replace(
      /const \[formDesc, setFormDesc\] = useState\(""\);/,
      'const [formDesc, setFormDesc] = useState("");\n  const [formTemplateText, setFormTemplateText] = useState("");'
    );
  }

  // Add to Firestore save
  content = content.replace(
    /description: formDesc,/,
    'description: formDesc,\n        templateText: formTemplateText,'
  );

  // Clear state on success (or just let it be, the modal unmounts or we might need to reset it)
  // Let's add it to the UI form
  const templateTextUI = `
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>هيكل القالب (للمولد الذكي) <span className="text-xs text-brand bg-brand/10 px-2 py-0.5 rounded-full mr-2">اختياري</span></span>
                    </label>
                    <textarea
                      rows={5}
                      value={formTemplateText}
                      onChange={(e) => setFormTemplateText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all resize-none font-medium text-sm text-gray-600"
                      placeholder="انسخ محتوى الخطاب هنا لتمكين الذكاء الاصطناعي من تعبئته لاحقاً (مثال: السلام عليكم ورحمة الله، السيد/ [الاسم]...)"
                    />
                  </div>
`;

  if (!content.includes('هيكل القالب (للمولد الذكي)')) {
    content = content.replace(
      /<div>\n\s*<label className="block text-sm font-bold text-gray-700 mb-1\.5">\n\s*وصف القالب السريع/,
      templateTextUI + '\n                  <div>\n                    <label className="block text-sm font-bold text-gray-700 mb-1.5">\n                      وصف القالب السريع'
    );
  }

  // Update AI request to use templateText
  content = content.replace(
    /templateContent: aiTemplate\?\.title \+ " - " \+ \(aiTemplate\?\.description \|\| ""\)/,
    'templateContent: aiTemplate?.templateText || (aiTemplate?.title + " - " + (aiTemplate?.description || ""))'
  );

  fs.writeFileSync(file, content);
  console.log("Updated " + file);
});
