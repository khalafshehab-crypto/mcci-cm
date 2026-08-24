const fs = require('fs');

let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

// Add state
content = content.replace(
  /const \[formGender, setFormGender\] = useState<"MALE" \| "FEMALE">\("MALE"\);/,
  `const [formGender, setFormGender] = useState<"MALE" | "FEMALE">("MALE");\n  const [formGeminiApiKey, setFormGeminiApiKey] = useState("");`
);

// Add to resetFormFields
content = content.replace(
  /setFormGender\("MALE"\);/,
  `setFormGender("MALE");\n    setFormGeminiApiKey("");`
);

// Add to edit handler
content = content.replace(
  /setFormGender\(\(emp as any\)\.gender \|\| "MALE"\);/,
  `setFormGender((emp as any).gender || "MALE");\n    setFormGeminiApiKey(emp.geminiApiKey || "");`
);

// Add to handleSaveEmployee payload
content = content.replace(
  /joinDate: existingEmployee\?.joinDate \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\.replace\(\/-\/g, '\/'\),/,
  `joinDate: existingEmployee?.joinDate || new Date().toISOString().split('T')[0].replace(/-/g, '/'),\n        geminiApiKey: formGeminiApiKey.trim(),`
);

// Add UI to the modal
content = content.replace(
  /<div>\s*<label className="block text-\[11px\] text-gray-500 font-extrabold mb-1\.5">رقم الجوال<\/label>\s*<input type="tel" required value=\{formPhone\}/,
  `<div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      مفتاح الذكاء الاصطناعي (BYOK)
                    </label>
                    <input 
                      type="password" 
                      placeholder="AIzaSy..." 
                      value={formGeminiApiKey} 
                      onChange={(e) => setFormGeminiApiKey(e.target.value)} 
                      dir="ltr" 
                      className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-semibold text-left outline-none focus:border-brand" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">رقم الجوال</label>
                    <input type="tel" required value={formPhone}`
);

fs.writeFileSync('src/pages/OrgChart.tsx', content);
