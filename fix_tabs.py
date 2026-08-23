import re

with open('src/pages/OrgChart.tsx', 'r') as f:
    content = f.read()

pattern = r'''        <button
          onClick=\{\(\) => setActiveTab\("design_settings"\)\}
          className=\{`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer \$\{ activeTab === "design_settings" \? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900" \}`\}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>تنظيم التصميم</span>
        </button>
          </div>
        \)\}
      </div>
      \{\/\* 3\. PRESENTATION OF ACTIVE VIEWPORT \*\*\}'''

replace = r'''        <button
          onClick={() => setActiveTab("design_settings")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${ activeTab === "design_settings" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900" }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>تنظيم التصميم</span>
        </button>
          </>
        )}
      </div>
      {/* 3. PRESENTATION OF ACTIVE VIEWPORT */}'''

new_content = re.sub(r'          </div>\n        \)\}\n      </div>\n      \{\/\* 3\. PRESENTATION OF ACTIVE VIEWPORT', r'          </>\n        )}\n      </div>\n      {/* 3. PRESENTATION OF ACTIVE VIEWPORT', content)

with open('src/pages/OrgChart.tsx', 'w') as f:
    f.write(new_content)
