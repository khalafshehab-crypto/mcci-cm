const fs = require('fs');
let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const accountSettingsTab = `
        {/* TAB: ACCOUNT SETTINGS */}
        {activeTab === "account_settings" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-3xl">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-800" />
              <span>إعدادات الحساب الشخصي</span>
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  مفتاح الذكاء الاصطناعي (BYOK)
                </h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  أدخل مفتاح Gemini API الخاص بك لتفعيل ميزات الذكاء الاصطناعي باستخدام حصتك المجانية الخاصة، دون الاعتماد على مفتاح مدير النظام.
                </p>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={localStorage.getItem('BYOK_GEMINI_API_KEY') || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      localStorage.setItem('BYOK_GEMINI_API_KEY', e.target.value);
                    } else {
                      localStorage.removeItem('BYOK_GEMINI_API_KEY');
                    }
                    // Force re-render to show updated value
                    setMasterSearchQuery(masterSearchQuery + ' ');
                    setTimeout(() => setMasterSearchQuery(masterSearchQuery.trim()), 0);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono dir-ltr focus:border-brand outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}
`;

content = content.replace(
  `{/* TAB 1: EMPLOYEES */}`,
  accountSettingsTab + `\n        {/* TAB 1: EMPLOYEES */}`
);

fs.writeFileSync('src/pages/OrgChart.tsx', content);
