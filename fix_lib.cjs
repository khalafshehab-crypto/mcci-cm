const fs = require('fs');
let code = fs.readFileSync('src/pages/Library.tsx', 'utf8');

// Find the broken part
let brokenStr = `              <Mail className="w-4 h-4" />
            </          <div className="relative dropdown-container">`;

let replacement = `              <Mail className="w-4 h-4" />
            </button>

            <div className="w-[1px] bg-gray-200 my-1 mx-0.5" />

            {/* View Toggles */}
            <button
              onClick={() => setViewMode("cards")}
              className={\`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer \${
                viewMode === "cards"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }\`}
              title="بطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={\`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer \${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }\`}
              title="سجل"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowWorkspaceCenter(!showWorkspaceCenter)}
            className={\`h-10 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto \${
              showWorkspaceCenter
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }\`}
          >
            <RefreshCw
              className={\`w-4 h-4 \${showWorkspaceCenter ? "animate-spin" : ""}\`}
            />
            <span>
              {showWorkspaceCenter
                ? "إغلاق بوابة Google Workspace"
                : "مزامنة Google Workspace 🌐"}
            </span>
          </button>

          <div className="relative dropdown-container">`;

if (code.includes(brokenStr)) {
  code = code.replace(brokenStr, replacement);
}

let brokenEnd = `          </div>
        </div>rkspaceCenter
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }\`}
          >
            <RefreshCw
              className={\`w-4 h-4 \${showWorkspaceCenter ? "animate-spin" : ""}\`}
            />
            <span>
              {showWorkspaceCenter
                ? "إغلاق بوابة Google Workspace"
                : "مزامنة Google Workspace 🌐"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setWizardStep("type"); setIsWizardOpen(true); }}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
          >
            <Wand2 className="w-4 h-4 stroke-[2.5]" />
            <span>إنشاء قالب</span>
          </button>
          <button
            type="button"
            onClick={openGenerateWizard}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>توليد خطاب ذكي</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>زر استيراد وتصدير النماذج الجهازة</span>
          </button>
        </div>
      </div>`;

let replacementEnd = `          </div>
        </div>
      </div>`;

if (code.includes(brokenEnd)) {
  code = code.replace(brokenEnd, replacementEnd);
}

fs.writeFileSync('src/pages/Library.tsx', code);
console.log('Fixed Library.tsx');
